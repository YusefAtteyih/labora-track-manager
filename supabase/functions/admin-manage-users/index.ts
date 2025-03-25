
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { action, userId, email } = await req.json();
    
    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase URL or service role key");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify that the requester is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Unauthorized - Invalid token");
    }
    
    // Check if the user is an admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
      
    if (userError || !userData) {
      console.error("User error:", userError);
      throw new Error("Unauthorized - User not found");
    }
    
    if (userData.role !== "org_admin") {
      throw new Error("Unauthorized - Admin role required");
    }
    
    // Perform the requested action
    if (action === "delete") {
      // Delete the user
      console.log(`Admin ${user.id} is deleting user ${userId}`);
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "User deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (action === "reset-password") {
      // Send password reset email
      console.log(`Admin ${user.id} is resetting password for user ${userId} (${email})`);
      const { error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: email,
      });
      
      if (error) {
        console.error("Error sending password reset:", error);
        throw error;
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "Password reset email sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else {
      throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

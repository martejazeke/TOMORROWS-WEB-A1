const supabaseConfig = {
    url: "https://orlrmrmleiiqppvtrgmc.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybHJtcm1sZWlpcXBwdnRyZ21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTcyMTUsImV4cCI6MjA2MzgzMzIxNX0.NmpU9rj_gc6gbYdVulKuc_2Xi7dgWjpKYZLYldnXknE"
};

// Initialize the Supabase client
const supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.key);

export { supabaseClient, supabaseConfig };
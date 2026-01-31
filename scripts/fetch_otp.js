
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://serzynsvkvzmrxesrcnl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnp5bnN2a3Z6bXJ4ZXNyY25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQxNjY3MSwiZXhwIjoyMDgwOTkyNjcxfQ.vehWQYkIj_SfOeFl-BYmk2X4NtQZjt0bPcyrZoyzcEI'
);

async function getLatestOTP() {
    const { data, error } = await supabase
        .from('otps')
        .select('code')
        .eq('email', 'yerukol2@msu.edu')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching OTP:', error);
        process.exit(1);
    }

    if (data && data.length > 0) {
        console.log(data[0].code);
    } else {
        console.log('No OTP found');
    }
}

getLatestOTP();

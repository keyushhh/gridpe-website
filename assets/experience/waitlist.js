/** Submit only the fields supported by GridPe's existing insert-only endpoint. */
export async function joinWaitlist(email, request = fetch) {
  const value = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error('Please enter a valid email address.');
  }
  const configResponse = await request('/assets/experience/waitlist.json');
  if (!configResponse.ok) throw new Error('Signup is temporarily unavailable.');
  const config = await configResponse.json();
  const response = await request(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ email: value, source: 'website' }),
  });
  if (!response.ok && response.status !== 409) {
    throw new Error('Could not join the waitlist. Please try again.');
  }
  return { success: true };
}

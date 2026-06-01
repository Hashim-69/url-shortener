import { query } from '../db';

export async function recordClick(
  linkId: number,
  ipAddress: string | undefined,
  referrer: string | undefined,
  userAgent: string | undefined
) {
  await query(
    `INSERT INTO clicks (link_id, ip_address, referrer, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [linkId, ipAddress || null, referrer || null, userAgent || null]
  );
}

export async function getClickStats(linkId: number) {
  const totalClicks = await query(
    'SELECT COUNT(*)::int as count FROM clicks WHERE link_id = $1',
    [linkId]
  );

  const clicksOverTime = await query(
    `SELECT date(created_at) as date, COUNT(*)::int as count
     FROM clicks
     WHERE link_id = $1
     GROUP BY date(created_at)
     ORDER BY date ASC`,
    [linkId]
  );

  const referrers = await query(
    `SELECT
       CASE
         WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
         ELSE referrer
       END as source,
       COUNT(*)::int as count
     FROM clicks
     WHERE link_id = $1
     GROUP BY source
     ORDER BY count DESC`,
    [linkId]
  );

  const devices = await query(
    `SELECT
       CASE
         WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
         WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
         ELSE 'Desktop'
       END as device,
       COUNT(*)::int as count
     FROM clicks
     WHERE link_id = $1
     GROUP BY device
     ORDER BY count DESC`,
    [linkId]
  );

  return {
    totalClicks: totalClicks.rows[0]?.count || 0,
    clicksOverTime: clicksOverTime.rows,
    referrers: referrers.rows,
    devices: devices.rows,
  };
}

import db from '../db';

export function recordClick(linkId: number, ipAddress: string | undefined, referrer: string | undefined, userAgent: string | undefined) {
  db.prepare(`
    INSERT INTO clicks (link_id, ip_address, referrer, user_agent)
    VALUES (?, ?, ?, ?)
  `).run(linkId, ipAddress || null, referrer || null, userAgent || null);
}

export function getClickStats(linkId: number) {
  const totalClicks = db.prepare(
    'SELECT COUNT(*) as count FROM clicks WHERE link_id = ?'
  ).get(linkId) as { count: number };

  const clicksOverTime = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM clicks
    WHERE link_id = ?
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all(linkId);

  const referrers = db.prepare(`
    SELECT 
      CASE 
        WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
        ELSE referrer 
      END as source,
      COUNT(*) as count
    FROM clicks
    WHERE link_id = ?
    GROUP BY source
    ORDER BY count DESC
  `).all(linkId);

  const userAgents = db.prepare(`
    SELECT 
      CASE 
        WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
        WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
        ELSE 'Desktop'
      END as device,
      COUNT(*) as count
    FROM clicks
    WHERE link_id = ?
    GROUP BY device
    ORDER BY count DESC
  `).all(linkId);

  return {
    totalClicks: totalClicks.count,
    clicksOverTime,
    referrers,
    devices: userAgents,
  };
}

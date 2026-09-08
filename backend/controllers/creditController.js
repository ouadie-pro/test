const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 500,
    resolution: '720p',
    features: ['500 credits / month', 'Up to 720p', 'Watermarked output', 'Community support'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 12,
    credits: 2000,
    resolution: '1080p',
    features: [
      '2,000 credits / month',
      'Up to 1080p',
      'No watermark',
      'Email support',
      'Standard generation speed',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39,
    credits: 8000,
    resolution: '1080p',
    features: [
      '8,000 credits / month',
      'Up to 1080p',
      'Priority generation queue',
      'API access',
      'Email + chat support',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    credits: 50000,
    resolution: '1080p',
    features: [
      '50,000 credits / month',
      'Up to 1080p',
      'Dedicated capacity',
      'Full API access',
      'SSO + audit logs',
      '24/7 priority support',
    ],
  },
];

exports.getBalance = async (req, res) => {
  res.json({ credits: req.user.credits, plan: req.user.plan });
};

exports.listPlans = async (req, res) => {
  res.json({ plans: PLANS });
};

exports.upgrade = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const found = PLANS.find((p) => p.id === plan);
    if (!found) return res.status(400).json({ error: 'Unknown plan' });
    req.user.plan = found.id;
    req.user.credits = Math.max(req.user.credits, found.credits);
    await req.user.save();
    res.json({ user: req.user, plan: found });
  } catch (err) {
    next(err);
  }
};

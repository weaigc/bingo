'use server'

import {publicIp, publicIpv4, publicIpv6} from 'public-ip';
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json({
    ipv4: await publicIpv4(),
    ipv6: await publicIpv6()
  })
}

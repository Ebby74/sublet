import { prisma } from '@/lib/prisma';

export interface OfferLetterData {
  offerId: string;
  roomName: string;
  propertyAddress: string;
  monthlyRent: number;
  deposit: number;
  offerAmount: number;
  moveInDate: string;
  prospectName: string;
  prospectEmail?: string;
}

export async function generateOfferLetterHTML(offerId: string): Promise<string> {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      room: {
        include: {
          floor: {
            include: {
              property: { select: { name: true, address: true } }
            }
          }
        }
      },
      prospect: true,
    },
  });

  if (!offer) {
    throw new Error('Offer not found');
  }

  const rentFormatted = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(offer.amountSen / 100);

  const depositFormatted = offer.room.depositSen
    ? new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(offer.room.depositSen / 100)
    : 'N/A';

  const propertyAddress = offer.room.floor.property.address;
  const moveInFormatted = new Date(offer.moveInDate).toLocaleDateString('en-GB');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Rental Offer Letter</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    h1 { color: #1a56db; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; color: #555; }
    .value { margin-left: 10px; }
    .terms { background: #f3f4f6; padding: 15px; margin-top: 20px; }
    .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature-line { border-top: 1px solid #000; width: 200px; padding-top: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RENTAL OFFER LETTER</h1>
    <p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
  </div>

  <div class="section">
    <p><span class="label">Property Address:</span> <span class="value">${propertyAddress}</span></p>
    <p><span class="label">Room:</span> <span class="value">${offer.room.name}</span></p>
  </div>

  <div class="section">
    <p><span class="label">Monthly Rent:</span> <span class="value">${rentFormatted}</span></p>
    <p><span class="label">Security Deposit:</span> <span class="value">${depositFormatted}</span></p>
    <p><span class="label">Proposed Move-in Date:</span> <span class="value">${moveInFormatted}</span></p>
  </div>

  <div class="section">
    <p><span class="label">Prospect:</span> <span class="value">${offer.prospect.name}</span></p>
    ${offer.prospect.email ? `<p><span class="label">Email:</span> <span class="value">${offer.prospect.email}</span></p>` : ''}
  </div>

  <div class="terms">
    <h3>Terms and Conditions</h3>
    <ol>
      <li>This offer is valid for 48 hours from acceptance.</li>
      <li>Security deposit required within 48 hours of acceptance.</li>
      <li>Lease agreement to be signed on move-in date.</li>
      <li>Utilities to be discussed upon lease signing.</li>
    </ol>
  </div>

  <div class="signatures">
    <div>
      <div class="signature-line">Landlord Signature</div>
      <div>Date: _____________</div>
    </div>
    <div>
      <div class="signature-line">Tenant Signature</div>
      <div>Date: _____________</div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function createTenantFromOffer(offerId: string, userId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      room: true,
      prospect: true,
    },
  });

  if (!offer || offer.status !== 'accepted') {
    throw new Error('Accepted offer not found');
  }

  const tenant = await prisma.tenant.create({
    data: {
      name: offer.prospect.name,
      email: offer.prospect.email,
      phone: offer.prospect.phone,
      userId,
    },
  });

  await prisma.room.update({
    where: { id: offer.roomId },
    data: { status: 'rented' },
  });

  await prisma.prospect.update({
    where: { id: offer.prospectId },
    data: { status: 'tenant' },
  });

  return tenant;
}

export async function getOfferStats(userId: string) {
  const offers = await prisma.offer.findMany({
    where: { room: { floor: { property: { userId } } } },
    select: { status: true },
  });

  const total = offers.length;
  const pending = offers.filter(o => o.status === 'pending').length;
  const accepted = offers.filter(o => o.status === 'accepted').length;
  const rejected = offers.filter(o => o.status === 'rejected').length;
  const conversionRate = total > 0 ? (accepted / total) * 100 : 0;

  return {
    total,
    pending,
    accepted,
    rejected,
    conversionRate,
  };
}
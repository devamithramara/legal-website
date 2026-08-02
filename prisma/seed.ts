import { PrismaClient, Role, AppointmentStatus, CaseStatus, TaskStatus, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data in correct dependency order
  await prisma.transaction.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.caseEvent.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.case.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const juniorPassword = await bcrypt.hash('junior123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Senior Advocate (Admin)',
      email: 'admin@firm.com',
      phone: '+919876543210',
      role: Role.ADMIN,
      password: adminPassword,
    },
  });

  const junior = await prisma.user.create({
    data: {
      name: 'Junior Advocate Rahul',
      email: 'junior@firm.com',
      phone: '+918765432109',
      role: Role.JUNIOR,
      password: juniorPassword,
    },
  });

  const client = await prisma.user.create({
    data: {
      name: 'Amit Sharma (Client)',
      email: 'client@firm.com',
      phone: '+917654321098',
      role: Role.CLIENT,
      password: clientPassword,
    },
  });

  console.log('Users created successfully.');

  // Create Appointment
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 2); // 2 days later

  const appointment = await prisma.appointment.create({
    data: {
      clientId: client.id,
      date: appointmentDate,
      timeSlot: '11:00 AM',
      caseType: 'Criminal',
      status: AppointmentStatus.CONFIRMED,
      paymentId: 'pay_MOCK1234567',
      feePaid: 1500.0,
      notes: 'Consultation regarding a civil property dispute and title verification.',
    },
  });

  // Create Case
  const hearingDate = new Date();
  hearingDate.setDate(hearingDate.getDate() + 10); // 10 days later

  const courtCase = await prisma.case.create({
    data: {
      clientId: client.id,
      assignedTo: junior.id,
      caseNumber: 'SC/2026/8942',
      title: 'Sharma vs. State of Maharashtra',
      type: 'Criminal',
      status: CaseStatus.ACTIVE,
      nextHearing: hearingDate,
      court: 'High Court of Bombay, Room 14',
    },
  });

  // Create CaseEvent (timeline entry)
  await prisma.caseEvent.create({
    data: {
      caseId: courtCase.id,
      eventDate: new Date(),
      title: 'Bail Application Filed',
      notes: 'Bail application filed in District Court. Arguments set for next week.',
    },
  });

  // Create Document
  await prisma.document.create({
    data: {
      uploadedById: client.id,
      caseId: courtCase.id,
      name: 'aadhaar_card_proof.pdf',
      url: 'https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg',
      type: 'ID Proof',
    },
  });

  // Create Invoice
  const invoice = await prisma.invoice.create({
    data: {
      clientId: client.id,
      amount: 15000.0,
      gstNumber: '27AADCB2230F1ZS',
      status: InvoiceStatus.PAID,
      pdfUrl: '/invoices/invoice-001.pdf',
    },
  });

  // Create Expense
  const expense = await prisma.expense.create({
    data: {
      title: 'Office Broadband Internet',
      amount: 1250.0,
      category: 'Office Supplies',
      date: new Date(),
      description: 'Monthly fiber internet connection fee.',
    },
  });

  // Create Transactions (Financial Ledger)
  await prisma.transaction.create({
    data: {
      type: 'INFLOW',
      amount: 1500.0,
      category: 'Consultation',
      referenceId: appointment.id,
      description: `Consultation fee for appointment with ${client.name}`,
    },
  });

  await prisma.transaction.create({
    data: {
      type: 'INFLOW',
      amount: 15000.0,
      category: 'Legal Fees',
      referenceId: invoice.id,
      description: `Legal service retainer for case ${courtCase.caseNumber}`,
    },
  });

  await prisma.transaction.create({
    data: {
      type: 'OUTFLOW',
      amount: 1250.0,
      category: 'Utilities',
      referenceId: expense.id,
      description: 'Internet subscription payment',
    },
  });

  // Create Junior Task
  const taskDeadline = new Date();
  taskDeadline.setDate(taskDeadline.getDate() + 4);

  await prisma.task.create({
    data: {
      caseId: courtCase.id,
      assignedTo: junior.id,
      title: 'Prepare brief for High Court bail argument',
      status: TaskStatus.IN_PROGRESS,
      deadline: taskDeadline,
      billableHours: 5.5,
    },
  });

  // Create Testimonial
  await prisma.testimonial.create({
    data: {
      clientId: client.id,
      rating: 5,
      body: 'Professional service, clear consultation, and fast responses on document checks. Highly recommended for property and contract verification!',
      caseType: 'Property',
      verified: true,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

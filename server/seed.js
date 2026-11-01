require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Donation = require('./models/Donation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fundraiser_db';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Donation.deleteMany({});
    console.log('[Seed] Cleared existing data.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    const adminUser = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@fundraiser.org',
      passwordHash: adminPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    const organizerUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.organizer@fundraiser.org',
      passwordHash: userPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    });

    const donorUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex.donor@fundraiser.org',
      passwordHash: userPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    });

    console.log('[Seed] Created 3 demo users (Admin, Organizer, Donor).');

    // 2. Define Sample Campaigns
    const sampleCampaignsData = [
      {
        title: 'Emergency Pediatric Heart Surgery for Baby Leo',
        shortDescription: 'Supporting 10-month-old Leo with critical cardiac surgery and post-operative intensive care recovery.',
        description: 'Ten-month-old Leo was diagnosed with severe Congenital Heart Defect (Tetralogy of Fallot) shortly after birth. His pediatric cardiologists have advised that he requires urgent corrective open-heart surgery within the next 45 days.\n\nHis family is doing everything possible, but specialized pediatric surgical care, intensive care monitoring, and medications exceed what their medical insurance covers. Every donation brings Leo one heartbeat closer to running, laughing, and growing up healthy.\n\nAll funds will be directly disbursed for surgical theatre fees, anesthesiology, PICU hospitalization, and essential post-op recovery care.',
        category: 'Medical',
        image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 25000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        organizer: organizerUser._id,
        featured: true,
        status: 'active',
        updates: [
          {
            title: 'Surgical Consult Completed',
            content: 'The surgical team at Children’s Cardiac Institute reviewed Leo’s latest ultrasound. Procedure tentatively set for next month!',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            title: 'Over 60% of Target Achieved! ❤️',
            content: 'Words cannot express our deep gratitude to every single donor. Thank you for giving Leo a fighting chance.',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
        sampleDonations: [
          { name: 'Dr. Marcus Webb', email: 'mwebb@health.org', amount: 1500, message: 'Praying for baby Leo. Stay strong family!', isAnon: false },
          { name: 'Anonymous Supporter', email: 'supporter1@mail.com', amount: 500, message: 'Sending strength and healing thoughts.', isAnon: true },
          { name: 'Alex Rivera', email: 'alex.donor@fundraiser.org', amount: 250, message: 'May Leo have a full and joyful life ahead.', isAnon: false },
          { name: 'Grace Community Church', email: 'grace@giving.org', amount: 3000, message: 'Our entire congregation is keeping Leo in our prayers.', isAnon: false },
        ],
      },
      {
        title: 'STEM Learning Lab & Coding Kits for Rural School',
        shortDescription: 'Equipping 350 underserved students in Maple Creek with robotics kits, computers, and science lab gear.',
        description: 'Access to modern digital education shouldn’t be determined by your zip code. Maple Creek Elementary lacks basic computing hardware, science apparatus, and internet-ready devices for its classrooms.\n\nThis campaign will establish a fully furnished STEM innovation hub complete with 25 desktop workstations, 50 micro-controllers & robotics kits, solar-powered battery backups, and high-speed satellite learning connectivity.\n\nOur teachers have completed curriculum training and are ready to inspire the next generation of engineers, coders, and scientists!',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 12000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        organizer: organizerUser._id,
        featured: true,
        status: 'active',
        updates: [
          {
            title: 'Classroom Space Prepared',
            content: 'The old storage wing has been painted, wired with safety breakers, and cleaned ready for workstation installation!',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
        ],
        sampleDonations: [
          { name: 'Silicon Tech Alumni', email: 'tech-alumni@gmail.com', amount: 2500, message: 'Every kid deserves to code. Best of luck Maple Creek!', isAnon: false },
          { name: 'Elena Rostova', email: 'elena.r@edu.org', amount: 300, message: 'Empowering children through technology is the best investment.', isAnon: false },
          { name: 'Alex Rivera', email: 'alex.donor@fundraiser.org', amount: 150, message: 'Proud to support our future innovators.', isAnon: false },
        ],
      },
      {
        title: 'Coastal Mangrove Reforestation & Ocean Cleanup',
        shortDescription: 'Restoring 25,000 native mangrove trees along vulnerable coastal belts to prevent erosion and marine loss.',
        description: 'Mangroves protect coastal communities from devastating storm surges, filter agricultural run-off before it reaches coral reefs, and store up to 5x more carbon than terrestrial rainforests.\n\nWe have partnered with coastal village youth and marine biologists to collect native propagules, nurse seedlings, and plant 25,000 mangrove saplings across 15 hectares of degraded coastline.\n\nYour support funds seedling nursery care, bamboo wave-attenuation fences, local conservation ranger stipends, and community cleanup equipment.',
        category: 'Environment',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 30000,
        deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        organizer: adminUser._id,
        featured: true,
        status: 'active',
        updates: [
          {
            title: 'First 5,000 Seedlings Germinated',
            content: 'Our coastal nursery has successfully germinated the first batch of Rhizophora saplings with a 94% survival rate.',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
        sampleDonations: [
          { name: 'Blue Horizon Oceans', email: 'contact@bluehorizon.org', amount: 5000, message: 'Protecting our coastlines for generations to come.', isAnon: false },
          { name: 'David Cho', email: 'dcho@earthcare.net', amount: 750, message: 'Rooting for our planet!', isAnon: false },
          { name: 'Nature Enthusiast', email: 'anon-green@forest.org', amount: 200, message: '', isAnon: true },
        ],
      },
      {
        title: 'Hope Paws: Medical Care & Shelter for Rescued Dogs',
        shortDescription: 'Providing life-saving veterinary treatment, vaccinations, and winter shelter for 80+ abandoned rescue animals.',
        description: 'Hope Paws Animal Shelter takes in animals that have been neglected, abandoned, or injured on highways. With winter approaching, our heating infrastructure is failing and our veterinary medical fund is depleted.\n\nThis fundraiser will provide:\n• Orthopedic surgery and treatments for 14 injured dogs\n• Crucial vaccinations, deworming, and microchipping for all residents\n• Installation of thermal insulation and heating panels in the shelter kennels\n• 6 months of nutritious veterinary-grade food supply.',
        category: 'Animal Welfare',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 15000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        organizer: organizerUser._id,
        featured: false,
        status: 'active',
        updates: [
          {
            title: 'Rescue Pup Barnaby Adopted! 🐕',
            content: 'Thanks to medical care funded by this campaign, Barnaby’s leg has fully healed and he went home with a loving family!',
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
        ],
        sampleDonations: [
          { name: 'Rachel Green', email: 'rachel.pets@gmail.com', amount: 400, message: 'For all the furry souls who deserve safety and warmth.', isAnon: false },
          { name: 'Anonymous Dog Lover', email: 'pawslover@yahoo.com', amount: 250, message: 'Thank you for your tireless rescue work!', isAnon: true },
          { name: 'Alex Rivera', email: 'alex.donor@fundraiser.org', amount: 100, message: 'Wishing all pups happy homes.', isAnon: false },
        ],
      },
      {
        title: 'Clean Solar Water Filtration for Village Community',
        shortDescription: 'Installing a durable solar-powered reverse osmosis clean water kiosk for 1,200 villagers facing fluoride poisoning.',
        description: 'In the arid rural hamlet of Dharampur, high ground fluoride levels have caused crippling skeletal fluorosis among elderly residents and dental decay in school children. Mothers and young girls walk over 4 kilometers twice daily to fetch brackish water.\n\nOur project will construct a solar-powered water filtration station that purifies 10,000 liters of safe drinking water per day, completely free of toxic heavy metals and pathogens.\n\nCommunity elders will manage the facility with local maintenance technicians trained for sustainability.',
        category: 'Community',
        image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 18000,
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        organizer: adminUser._id,
        featured: true,
        status: 'active',
        updates: [
          {
            title: 'Hydro-geological Survey Completed',
            content: 'Groundwater coordinates identified with optimal recharge rate for zero-impact extraction.',
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          },
        ],
        sampleDonations: [
          { name: 'Global Clean Water Initiative', email: 'grants@cleanwater.org', amount: 6000, message: 'Water is life. Clean water is a human right.', isAnon: false },
          { name: 'Priya Sundaram', email: 'priya.s@ngo.in', amount: 500, message: 'Proud to see sustainable change in rural areas.', isAnon: false },
        ],
      },
      {
        title: 'Flash Flood Disaster Relief & Emergency Family Kits',
        shortDescription: 'Delivering urgent food rations, clean bedding, water purification tablets, and shelter kits to 500 displaced families.',
        description: 'Unprecedented flash flooding following torrential monsoon rains has submerged entire townships, leaving hundreds of families homeless with only the clothes on their backs.\n\nOur disaster response team is on the ground coordinating with local emergency authorities to dispatch:\n1. 500 Heavy-duty Waterproof Family Tents\n2. 2-week emergency dry ration food baskets (rice, lentils, oil, milk powder)\n3. First-aid packs, water disinfection tablets, and hygiene kits\n4. Blankets and dry clothing sets for infants and seniors.',
        category: 'Emergency',
        image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 40000,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        organizer: adminUser._id,
        featured: true,
        status: 'active',
        updates: [
          {
            title: 'First Convoy Dispatched to Relief Camps',
            content: '150 emergency food kits and 200 tarpaulin sheets arrived in Sector 4 distribution center this morning.',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
        sampleDonations: [
          { name: 'United Relief Foundation', email: 'dispatch@unitedrelief.org', amount: 10000, message: 'Solidarity with the affected communities in this hard hour.', isAnon: false },
          { name: 'Anonymous Caring Donor', email: 'care@relief.org', amount: 1000, message: 'May relief reach every corner quickly.', isAnon: true },
          { name: 'Alex Rivera', email: 'alex.donor@fundraiser.org', amount: 350, message: 'Prayers and support for the families.', isAnon: false },
        ],
      },
      {
        title: 'Higher Education Scholarship Fund for First-Gen Girls',
        shortDescription: 'Providing tuition, laptop stipends, and mentorship for 20 bright young women pursuing STEM college degrees.',
        description: 'Bright young women from economically disadvantaged backgrounds often have to forfeit university admissions due to tuition costs and lack of digital learning tools.\n\nThis scholarship fund covers full 4-year tuition assistance, laptop stipends, and professional mentorship from senior women leaders in engineering, finance, and healthcare.\n\nHelp us break the cycle of poverty and unleash boundless potential through higher education.',
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 20000,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        organizer: organizerUser._id,
        featured: false,
        status: 'active',
        updates: [
          {
            title: 'Scholarship Application Window Open',
            content: 'Over 85 applications received across 6 partner high schools.',
            date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          },
        ],
        sampleDonations: [
          { name: 'Women in Tech Network', email: 'empower@womentech.io', amount: 4500, message: 'Here is to opening doors and shattering glass ceilings!', isAnon: false },
          { name: 'Sofia Martinez', email: 'sofia.m@university.edu', amount: 500, message: 'Education is the ultimate equalizer.', isAnon: false },
        ],
      },
      {
        title: 'Wildlife Sanctuary Winter Rehabilitation Clinic',
        shortDescription: 'Constructing warm intensive care units and treatment chambers for injured owls, foxes, and indigenous fauna.',
        description: 'Our nonprofit wildlife sanctuary receives over 600 distressed native animals annually, from migratory birds caught in power lines to orphaned woodland mammals during harsh winter frosts.\n\nWe need to build a winterized recovery clinic with radiant heating lamps, specialized oxygen therapy chambers, and a quiet nursery ward.\n\nEvery contribution saves precious lives and preserves our natural biodiversity.',
        category: 'Animal Welfare',
        image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80',
        goalAmount: 16000,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        organizer: organizerUser._id,
        featured: false,
        status: 'active',
        updates: [
          {
            title: 'Foundations Laid',
            content: 'Concrete foundation and insulation framing completed on schedule.',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
        ],
        sampleDonations: [
          { name: 'Friends of the Forest', email: 'forest@wildcare.org', amount: 2000, message: 'In honor of all the voiceless creatures sharing our planet.', isAnon: false },
          { name: 'Clara Oswald', email: 'clara@animals.org', amount: 300, message: 'Keep up the beautiful mission!', isAnon: false },
        ],
      },
    ];

    // 3. Insert Campaigns and their real matching donations
    let totalSeededDonationsCount = 0;
    let totalSeededFunds = 0;

    for (const data of sampleCampaignsData) {
      const { sampleDonations, ...campaignFields } = data;

      // Calculate exact raised amount from sample donations
      const totalRaised = sampleDonations.reduce((sum, d) => sum + d.amount, 0);
      const donorCount = sampleDonations.length;

      const campaign = await Campaign.create({
        ...campaignFields,
        raisedAmount: totalRaised,
        donorCount: donorCount,
      });

      // Insert actual donation records tied to this campaign
      for (const d of sampleDonations) {
        const txnId = `DEMO-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        await Donation.create({
          campaign: campaign._id,
          donor: d.email === donorUser.email ? donorUser._id : null,
          donorName: d.name,
          donorEmail: d.email,
          amount: d.amount,
          message: d.message,
          isAnonymous: d.isAnon,
          paymentStatus: 'completed',
          transactionId: txnId,
          paymentMethod: 'Demo Card',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        });
        totalSeededDonationsCount++;
        totalSeededFunds += d.amount;
      }

      console.log(`[Seed] Created Campaign: "${campaign.title}" with ${donorCount} donations ($${totalRaised.toLocaleString()})`);
    }

    console.log('====================================================');
    console.log('  ✅ Database Seed Completed Successfully!          ');
    console.log(`  📊 Users: 3 (Admin, Organizer, Donor)             `);
    console.log(`  🎯 Campaigns: ${sampleCampaignsData.length}        `);
    console.log(`  💰 Total Donations: ${totalSeededDonationsCount} ($${totalSeededFunds.toLocaleString()})`);
    console.log('====================================================');
    console.log('  🔑 Demo Credentials:                              ');
    console.log('  Admin:     admin@fundraiser.org / admin123        ');
    console.log('  Organizer: sarah.organizer@fundraiser.org / user123');
    console.log('  Donor:     alex.donor@fundraiser.org / user123    ');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedData();

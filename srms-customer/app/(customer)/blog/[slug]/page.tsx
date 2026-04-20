import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import Container from "@/components/layout/Container";
import BlogHero from "./BlogHero";
import type { Metadata } from "next";

const posts = [
  {
    slug: "summer-ac-maintenance",
    category: "Maintenance Tips",
    title: "5 AC Maintenance Tips Before the Summer Heat Hits",
    excerpt:
      "Don't wait for your AC to break down on the hottest day of the year. Here's a quick pre-summer checklist to keep your unit running efficiently.",
    author: "Ravi Kumar",
    date: "April 10, 2026",
    readTime: "4 min read",
    image: "/ac_maintenance.png",
    content: [
      {
        heading: "Why Pre-Summer AC Maintenance Matters",
        body: "As temperatures climb in India, air conditioners become essential — not optional. Yet most homeowners only think about their AC when it breaks down mid-summer, when service engineers are busiest and wait times are longest. A little attention in March or April can save you from discomfort, high electricity bills, and costly repairs.",
      },
      {
        heading: "1. Clean or Replace the Air Filter",
        body: "The air filter is your AC's first line of defence against dust, pollen, and airborne particles. A clogged filter forces the unit to work harder, increasing energy consumption and reducing cooling efficiency. Remove the filter, hold it up to the light — if you can't see through it, it's time to clean or replace it. Most filters can be rinsed with water and dried before reinstalling.",
      },
      {
        heading: "2. Check and Clean the Outdoor Unit",
        body: "The condenser unit outside your home needs unobstructed airflow to function properly. Clear away leaves, dust, or debris that may have accumulated around it. Use a garden hose to gently clean the fins. Ensure at least 2 feet of clearance on all sides. Never use a pressure washer — it can bend the fins and damage the unit.",
      },
      {
        heading: "3. Inspect the Refrigerant Lines",
        body: "The insulated copper pipes running from the outdoor unit into your home carry refrigerant. Look for signs of wear, cracks, or missing insulation. Poor insulation leads to energy loss and inconsistent cooling. If the lines look damaged, call a certified technician — refrigerant handling requires a professional.",
      },
      {
        heading: "4. Test the Thermostat and Remote",
        body: "Set your thermostat to a temperature lower than the current room temperature and check if the unit kicks in promptly. If the AC takes too long to respond or doesn't reach the set temperature, the thermostat may need calibration or the refrigerant level may be low. Replace the remote's batteries while you're at it.",
      },
      {
        heading: "5. Schedule a Professional Service",
        body: "Even if everything looks fine on the surface, an annual professional service is worth it. A trained engineer will check refrigerant levels, clean the evaporator coils, lubricate moving parts, check electrical connections, and test overall performance. Book before April — engineers fill up fast as summer approaches.",
      },
      {
        heading: "Final Thought",
        body: "Preventive maintenance is always cheaper than emergency repairs. A well-maintained AC also consumes 15–20% less electricity than a neglected one. Spend an hour on these checks now and your AC will reward you with a cool, efficient summer.",
      },
    ],
  },
  {
    slug: "electrical-safety-home",
    category: "Safety",
    title: "7 Electrical Safety Rules Every Homeowner Should Know",
    excerpt:
      "Faulty wiring is one of the leading causes of house fires in India. Learn what warning signs to watch for and when to call a professional.",
    author: "Priya Nair",
    date: "April 3, 2026",
    readTime: "5 min read",
    image: "/electrical_safety.jpg",
    content: [
      {
        heading: "Electricity: Invisible, Powerful, and Unforgiving",
        body: "Electrical failures cause thousands of house fires in India every year. Unlike a leaky pipe or a cracked wall, electrical problems are often invisible until they become dangerous. These seven rules can protect your home and family.",
      },
      {
        heading: "1. Never Ignore a Tripping Circuit Breaker",
        body: "If a breaker trips once, it did its job. If it trips repeatedly, something is wrong — an overloaded circuit, a short circuit, or a ground fault. Never tape a breaker in the 'on' position or replace it with a higher-rated fuse. Have an electrician diagnose the root cause.",
      },
      {
        heading: "2. Don't Overload Power Strips",
        body: "Plugging multiple high-wattage appliances (ACs, microwaves, geysers) into a single power strip is a fire hazard. Each outlet in your home is rated for a maximum load. Use dedicated circuits for heavy appliances and never daisy-chain power strips.",
      },
      {
        heading: "3. Check for Warm or Discoloured Outlets",
        body: "Outlets that feel warm to the touch or show black scorch marks around them indicate loose wiring or excessive heat buildup. Stop using them immediately and have them inspected. Warm switch plates are equally concerning.",
      },
      {
        heading: "4. Keep Water and Electricity Separate",
        body: "Install GFCI (Ground Fault Circuit Interrupter) outlets in bathrooms, kitchens, and outdoor areas. These detect imbalances in current and cut power within milliseconds — potentially saving lives. If your home is older, check whether these were installed.",
      },
      {
        heading: "5. Don't DIY Your Wiring",
        body: "YouTube tutorials make electrical work look approachable. It isn't. A mistake can create a hidden fault that causes a fire weeks or months later. Always hire a licensed electrician for anything beyond changing a light bulb or a fuse.",
      },
      {
        heading: "6. Inspect Cords and Plugs Regularly",
        body: "Frayed wires, cracked insulation, and bent prongs are all hazards. Replace damaged cords — don't repair them with tape. Avoid running cords under rugs or carpets where heat can't escape and damage goes unnoticed.",
      },
      {
        heading: "7. Know Where Your Main Switch Is",
        body: "In an emergency, every second counts. Make sure every family member knows where the main electrical panel is and how to shut off power to the entire home. Label each circuit breaker clearly so you can isolate a specific area without guessing.",
      },
    ],
  },
  {
    slug: "monsoon-plumbing-prep",
    category: "Seasonal Guide",
    title: "How to Prepare Your Plumbing for the Monsoon Season",
    excerpt:
      "Clogged drains, leaky pipes, and waterlogging — monsoon can wreak havoc on your home's plumbing. Here's how to get ahead of it.",
    author: "Arjun Mehta",
    date: "March 25, 2026",
    readTime: "6 min read",
    image: "/plumbing.jpg",
    content: [
      {
        heading: "Monsoon and Your Plumbing: An Underestimated Threat",
        body: "India's monsoon season brings relief from the heat — and a host of plumbing headaches. Overflowing drains, backflow from municipal systems, and pipe corrosion accelerated by moisture can turn a beautiful rainy day into a home repair emergency. Preparation is everything.",
      },
      {
        heading: "Clear All Drains Before the Rains Arrive",
        body: "Terrace drains, balcony outlets, bathroom floor drains, and kitchen sinks all need to be debris-free before monsoon. A clogged terrace drain can cause pooling water that seeps through the roof. Use a drain snake or call a plumber to clear any blockages you can't resolve with a plunger.",
      },
      {
        heading: "Inspect Pipes for Cracks and Corrosion",
        body: "Walk through your home and look for visible pipes — under sinks, behind the toilet, near the geyser. Check for rust stains, white mineral deposits, or dampness around joints. These are early signs of slow leaks that monsoon rains will worsen. Address them now before water pressure from heavy rains expands the damage.",
      },
      {
        heading: "Check Your Sump Pump (If You Have One)",
        body: "If your building or home has a sump pit, test the pump before monsoon. Pour water into the pit and confirm the pump activates and discharges water away from the foundation. A failed sump pump during heavy rain can mean a flooded basement or ground floor.",
      },
      {
        heading: "Seal Gaps Around Pipes Entering the Home",
        body: "Anywhere a pipe enters through a wall or floor is a potential water ingress point. Use waterproof sealant to close gaps around these entry points. This also keeps insects and rodents out — creatures that seek shelter from rain and often find their way in through these gaps.",
      },
      {
        heading: "Know Where Your Main Water Shutoff Is",
        body: "If a pipe bursts during monsoon, you need to act fast. Every homeowner should know where the main water shutoff valve is and how to operate it. Turn it off and on a few times now to make sure it isn't seized — valves that haven't been operated in years often get stuck.",
      },
      {
        heading: "When to Call a Plumber",
        body: "If you notice slow-draining sinks, gurgling sounds from drains, water stains on walls, or reduced water pressure — don't wait. These symptoms often point to underlying issues that get significantly worse once monsoon rains put the system under stress. A pre-monsoon inspection by a professional plumber is money well spent.",
      },
    ],
  },
  {
    slug: "deep-cleaning-guide",
    category: "Home Care",
    title: "The Ultimate Deep Cleaning Checklist for Indian Homes",
    excerpt:
      "Whether it's post-renovation dust or pre-festival cleaning, a thorough deep clean can transform your space. Here's a room-by-room guide.",
    author: "Ravi Kumar",
    date: "March 14, 2026",
    readTime: "7 min read",
    image: "/deep_cleaning.jpg",
    content: [
      {
        heading: "What Is Deep Cleaning and When Do You Need It?",
        body: "Regular cleaning maintains a home's surface appearance. Deep cleaning tackles the buildup that everyday cleaning misses — grease on kitchen cabinet tops, dust behind appliances, mould in bathroom grout, and grime in window tracks. Most homes benefit from a deep clean every 3–6 months, and definitely before Diwali, a move-in, or after construction.",
      },
      {
        heading: "Kitchen: The Most Demanding Room",
        body: "Start by emptying all cabinets and wiping shelves. Clean inside the oven, microwave, and refrigerator — remove shelves and drawers and wash them separately. Degrease the stovetop, chimney filter, and exhaust fan blades. Wipe down cabinet doors, handles, and the tops of cabinets where grease and dust collect. Descale the sink and clean the drain.",
      },
      {
        heading: "Bathrooms: Beyond the Surface",
        body: "Scrub tile grout with a stiff brush and a baking soda paste to remove mould and discolouration. Descale showerheads by soaking in vinegar overnight. Clean behind and under the toilet. Wipe down all fixtures, mirrors, and the exhaust fan cover. Check the caulk around the tub and sink — replace if it's cracked or mouldy.",
      },
      {
        heading: "Living and Dining Areas",
        body: "Move furniture and vacuum beneath it — you'll likely find a surprising amount of dust and debris. Clean ceiling fans, light fixtures, and the tops of bookshelves. Wipe down walls, light switches, and door handles. Vacuum and spot-clean upholstery. Wash or dry-clean curtains and cushion covers.",
      },
      {
        heading: "Bedrooms",
        body: "Wash all bedding including pillows, mattress covers, and duvets. Rotate or flip the mattress and vacuum it. Wipe down the inside of wardrobes, check for moisture or moth damage, and reorganise. Clean under the bed. Dust ceiling corners for cobwebs and wipe down all surfaces including skirting boards.",
      },
      {
        heading: "Often-Forgotten Spots",
        body: "Door tracks and window channels accumulate an astonishing amount of grime. Clean them with an old toothbrush. Wipe down all electrical switches and socket plates. Clean the washing machine drum by running a hot cycle with vinegar. Descale the geyser if it hasn't been done in over a year. Wipe down the main door and any security cameras or intercoms.",
      },
      {
        heading: "When to Hire Professionals",
        body: "Certain tasks — deep carpet cleaning, sofa shampooing, industrial kitchen degreasing, and post-construction cleanup — are best left to professionals with the right equipment. SRMS offers deep cleaning services across all major categories. Book a service and let our trained team handle the hard work.",
      },
    ],
  },
  {
    slug: "when-to-call-professional",
    category: "DIY vs Professional",
    title: "DIY or Call a Pro? How to Decide for Common Home Issues",
    excerpt:
      "Some jobs are safe to DIY; others can turn into costly disasters. Here's a practical guide to knowing the difference.",
    author: "Priya Nair",
    date: "March 5, 2026",
    readTime: "5 min read",
    image: "/diy_or_pro.jpg",
    content: [
      {
        heading: "The DIY Temptation",
        body: "With tutorials for everything available online, it's tempting to fix things yourself and save money. Sometimes that works out well. Other times, a ₹500 DIY attempt turns into a ₹15,000 professional repair. The key is knowing which category your problem falls into before you pick up a screwdriver.",
      },
      {
        heading: "Safe to DIY: Minor Repairs and Maintenance",
        body: "Painting walls, replacing light bulbs and tube lights, unclogging a drain with a plunger, patching small holes in drywall, replacing a tap washer, assembling flat-pack furniture — these are all well within the capabilities of a careful homeowner. They involve no structural risk and mistakes are easily corrected.",
      },
      {
        heading: "Proceed with Caution: Moderate Complexity",
        body: "Installing a ceiling fan (if you're comfortable with basic wiring), replacing a toilet flush mechanism, fixing a running toilet, or regrouting bathroom tiles can be DIY if you're handy and patient. Watch two or three professional-level tutorials, use proper tools, and have a professional's number ready if things go sideways.",
      },
      {
        heading: "Call a Professional: Electrical Work",
        body: "Any work involving your electrical panel, new wiring, adding outlets, or diagnosing recurring electrical issues should always go to a licensed electrician. The risk isn't just to property — it's to life. Hidden electrical faults can cause fires months after a 'successful' repair.",
      },
      {
        heading: "Call a Professional: Major Plumbing",
        body: "Replacing a showerhead or a tap? Go ahead. But if you're dealing with pipe replacement, low water pressure throughout the home, sewage backflow, or anything involving the main water line — call a plumber. Water damage from a botched repair can cost 10x more than the original service.",
      },
      {
        heading: "Call a Professional: Structural and Load-Bearing Work",
        body: "Never attempt to remove or modify walls, beams, or columns without a structural engineer's assessment. Even seemingly small modifications to load-bearing elements can compromise the integrity of the entire structure. This is non-negotiable.",
      },
      {
        heading: "A Simple Rule of Thumb",
        body: "Ask yourself: if this goes wrong, what's the worst case? If the answer is 'I waste an afternoon' — go ahead and DIY. If the answer is 'I flood my neighbour's apartment' or 'I could get electrocuted' — call a professional. SRMS connects you with verified engineers for exactly these situations.",
      },
    ],
  },
  {
    slug: "water-heater-care",
    category: "Appliances",
    title: "Extend the Life of Your Water Heater with These Simple Habits",
    excerpt:
      "A little maintenance goes a long way. Learn how to flush, inspect, and care for your geyser to avoid early replacements.",
    author: "Arjun Mehta",
    date: "February 22, 2026",
    readTime: "4 min read",
    image: "/water_heater.jpg",
    content: [
      {
        heading: "Why Your Geyser Needs Attention",
        body: "Most Indian households use a storage water heater (geyser) that runs daily, often for years without any maintenance. These appliances have a typical lifespan of 8–12 years, but neglect can cut that in half. With a few simple habits, you can maximise efficiency, reduce electricity consumption, and avoid unexpected failures.",
      },
      {
        heading: "Flush the Tank Annually",
        body: "Hard water, common across much of India, causes mineral sediment to accumulate at the bottom of the tank. This layer acts as an insulator between the heating element and the water, forcing the element to work harder and consume more electricity. Flushing the tank once a year removes this sediment. Turn off the power, connect a hose to the drain valve, and flush until the water runs clear.",
      },
      {
        heading: "Check and Replace the Anode Rod",
        body: "The anode rod is a sacrificial magnesium or aluminium rod that corrodes in place of the tank, protecting it from rust. Once it's depleted, the tank begins to corrode. Check the anode rod every 2–3 years and replace it when it's significantly reduced in diameter. This single habit can double the life of your geyser.",
      },
      {
        heading: "Set the Right Temperature",
        body: "Most geysers are factory-set to 60°C. This is fine for killing bacteria, but running it at 75°C or higher accelerates sediment buildup and puts unnecessary stress on the tank and heating element. For households without elderly or immunocompromised members, 55–60°C is sufficient and more efficient.",
      },
      {
        heading: "Don't Leave It On All Day",
        body: "Many households leave the geyser switched on continuously 'for convenience.' Modern geysers reheat water in 15–20 minutes. Use a timer or simply switch it on 20 minutes before you need it. This habit alone can reduce geyser-related electricity consumption by 30–40%.",
      },
      {
        heading: "Inspect the Pressure Relief Valve",
        body: "The temperature-pressure relief (TPR) valve is a safety device that releases pressure if the tank overheats. Test it annually by briefly lifting the lever — water should flow and stop cleanly when you release it. If it drips continuously or doesn't open, replace it immediately. A failed TPR valve is a safety hazard.",
      },
      {
        heading: "When to Call a Professional",
        body: "If your geyser is making rumbling or popping noises (sediment buildup), taking longer than usual to heat water, showing rust-coloured water, or leaking from the tank itself — it's time for a professional inspection. SRMS technicians can diagnose and service most major geyser brands, and advise you on whether repair or replacement makes more sense.",
      },
    ],
  },
];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };
  return { title: post.title, description: post.excerpt };
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Readonly<Props>) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-neutral-50">
      <BlogHero title={post.title} category={post.category} image={post.image} />

      {/* Meta */}
      <div className="bg-white border-b border-neutral-200">
        <Container>
          <div className="py-4 flex flex-wrap items-center gap-5 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {post.readTime}
            </span>
          </div>
        </Container>
      </div>

      {/* Content */}
      <Container>
        <div className="py-10 md:py-14 max-w-2xl">
          <p className="text-base text-neutral-600 leading-relaxed mb-10 border-l-4 border-primary-400 pl-4 italic">
            {post.excerpt}
          </p>

          {post.content.map((section) => (
            <div key={section.heading} className="mb-8">
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                {section.heading}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">{section.body}</p>
            </div>
          ))}

          <div className="mt-12 pt-6 border-t border-neutral-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-primary-600 font-medium hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

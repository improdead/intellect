"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useAnimation,
  LayoutGroup,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  Lightbulb,
  BarChart,
  MessageSquare,
  Users,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Atom,
  Dna,
  Globe,
  BookOpen,
  Code,
  Palette,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectShowcase from "@/components/subject-showcase";
import { useRouter } from "next/navigation";
import StackedCards from "@/components/stacked-cards";
import VideoPreview from "@/components/video-preview";
import TextRotate from "@/components/text/text-rotate";
import { BentoGrid, BentoGridItem } from "@/components/bento-grid";
import HeroText, { AnimatedTextCharacter } from "@/components/hero-text";
import Card3D from "@/components/3d-card";
import Spotlight from "@/components/spotlight";
import TextSpotlight, { MovingGradientText } from "@/components/text-spotlight";
import ScrollRevealSection, {
  ParallaxSection,
} from "@/components/scroll-section";
import ParallaxScroll, { FloatingElement } from "@/components/parallax-scroll";
import { CardStack } from "@/components/card-stack";
import GlareCard from "@/components/glare-card";
import { PerspectiveCard } from "@/components/perspective-cards";
import TypingEffect from "@/components/typing-effect";
import InfiniteMovingCards from "@/components/infinite-moving-cards";
import MagnetButton from "@/components/magnet-button";

// Dynamically import the background component with no SSR to avoid hydration issues
const WavyParticlesBackground = dynamic(
  () => import("@/components/wavy-particles-background"),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const router = useRouter();
  const controls = useAnimation();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);


  // Scroll animations
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -50]);

  useEffect(() => {
    setMounted(true);

    // Animate sections on load
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    });

    // Add scroll animation
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translateY(${
          scrollY * 0.1
        }px)`;
      }
    };

    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.style.scrollBehavior = "";
    };
  }, [controls]);



  const handleGetStarted = () => {
    setIsButtonClicked(true);
    setTimeout(() => {
      router.push("/login?returnTo=/dashboard");
    }, 600);
  };

  const nextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % featureCards.length);
  };

  const prevCard = () => {
    setActiveCardIndex(
      (prev) => (prev - 1 + featureCards.length) % featureCards.length
    );
  };

  if (!mounted) return null;

  const featureCards = [
    {
      bgColor: "bg-gradient-to-br from-purple-600 to-indigo-700",
      title: "AI-Powered Learning",
      description:
        "Our advanced AI understands your questions and creates personalized explanations tailored to your learning style and pace.",
      image: "/digital-brain-learning.png",
    },
    {
      bgColor: "bg-gradient-to-br from-blue-600 to-cyan-700",
      title: "Interactive Visualizations",
      description:
        "Complex concepts come to life through dynamic, interactive visualizations generated in real-time during your conversations.",
      image: "/dna-helix-interactive.png",
    },
    {
      bgColor: "bg-gradient-to-br from-indigo-600 to-purple-700",
      title: "Personalized Learning Path",
      description:
        "Our AI adapts to your progress, creating a customized learning journey that evolves as your understanding deepens.",
      image: "/personalized-learning-journey.png",
    },
    {
      bgColor: "bg-gradient-to-br from-violet-600 to-purple-700",
      title: "Natural Conversations",
      description:
        "Chat naturally as if you're talking to a human tutor, with the ability to ask follow-up questions and explore topics deeply.",
      image: "/ai-tutor-session.png",
    },
    {
      bgColor: "bg-gradient-to-br from-cyan-600 to-blue-700",
      title: "Progress Tracking",
      description:
        "Monitor your learning journey with detailed analytics and insights that help you identify strengths and areas for improvement.",
      image: "/learning-analytics-overview.png",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">

      {/* Wavy particles background */}
      <WavyParticlesBackground />

      {/* Floating elements */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <FloatingElement
          xFactor={30}
          yFactor={20}
          duration={6}
          className="absolute top-[15%] right-[10%]"
        >
          <div className="w-32 h-32 rounded-full bg-purple-500/10 blur-xl" />
        </FloatingElement>
        <FloatingElement
          xFactor={25}
          yFactor={35}
          duration={8}
          delay={1}
          className="absolute top-[65%] left-[15%]"
        >
          <div className="w-40 h-40 rounded-full bg-blue-500/10 blur-xl" />
        </FloatingElement>
        <FloatingElement
          xFactor={20}
          yFactor={15}
          duration={7}
          delay={2}
          className="absolute bottom-[20%] right-[20%]"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 blur-xl" />
        </FloatingElement>
      </div>

      <main className="relative pt-12 pb-20">
        <section className="container flex flex-col items-center justify-center text-center space-y-8 py-12 min-h-[90vh]">
          <Spotlight>
            <ScrollRevealSection
              animation="fade"
              className="max-w-4xl mx-auto space-y-4"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 backdrop-blur-sm font-robit-regular">
                Your ultimate learning companion
              </div>

              <div className="text-center mb-4">
                <HeroText
                  text="Learn anything with"
                  fontSize="7xl"
                  className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white"
                />
              </div>

              <div className="relative h-24 md:h-32 mb-4">
                <LayoutGroup>
                  <motion.div
                    className="flex whitespace-pre justify-center"
                    layout
                  >
                    <TextRotate
                      texts={[
                        "AI-powered",
                        "interactive",
                        "personalized",
                        "immersive",
                        "adaptive",
                        "engaging",
                      ]}
                      mainClassName="text-primary px-4 py-3 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 overflow-hidden justify-center rounded-lg text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
                      staggerFrom="last"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-120%" }}
                      staggerDuration={0.025}
                      splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 400,
                      }}
                      rotationInterval={2000}
                    />
                  </motion.div>
                </LayoutGroup>
              </div>

              <div className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                <TypingEffect
                  words={[
                    "conversations",
                    "learning",
                    "exploration",
                    "discovery",
                  ]}
                  className="font-robit-medium"
                  typingSpeed={80}
                  deletingSpeed={40}
                  delayBetweenWords={2000}
                />
              </div>

              <ParallaxSection speed={2} direction="up" className="mt-6">
                <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
                  Chat with an AI tutor that creates interactive visualizations
                  and explanations in real-time to help you understand complex
                  concepts instantly.
                </p>
              </ParallaxSection>
            </ScrollRevealSection>
          </Spotlight>

          <ScrollRevealSection
            animation="rise"
            delay={0.4}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <MagnetButton
              onClick={handleGetStarted}
              size="lg"
              glowOnHover={true}
              magneticIntensity={0.3}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
            >
              <span className="flex items-center gap-2">
                <span className="font-robit-bold">Start Chatting</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </MagnetButton>

            <ScrollRevealSection animation="fade" delay={0.4}>
              <MagnetButton
                variant="outlined"
                size="lg"
                magneticIntensity={0.2}
                className="border-primary/20 hover:bg-primary/5"
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <span className="font-robit-medium">See how it works</span>
              </MagnetButton>
            </ScrollRevealSection>
          </ScrollRevealSection>

          <div className="relative mt-16 w-full max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl -z-10"></div>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <VideoPreview
                src=""
                title="AI-Powered Learning Experience"
                description="See how our chatbot transforms education with interactive visualizations"
              />
            </motion.div>
          </div>
        </section>

        <section id="bento" className="py-20 container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="font-robit-bold">
                Explore our learning ecosystem
              </span>
            </h2>
            <p className="text-foreground/70 mt-4 max-w-2xl mx-auto">
              Discover all the ways Intellect can transform your learning
              experience
            </p>
          </motion.div>

          <BentoGrid
            items={[
              {
                title: "AI-Powered Tutoring",
                description:
                  "Get personalized explanations and answers to your questions with our advanced AI tutor.",
                icon: <Brain className="h-8 w-8 text-purple-500" />,
                color: "from-purple-500/20 to-indigo-500/20",
                width: "large",
                height: "medium",
                link: "/features/ai-tutor",
              },
              {
                title: "Interactive Visualizations",
                description:
                  "See complex concepts come to life with dynamic, interactive visualizations.",
                icon: <Sparkles className="h-8 w-8 text-blue-500" />,
                color: "from-blue-500/20 to-cyan-500/20",
                width: "medium",
                height: "medium",
                link: "/features/visualizations",
              },
              {
                title: "Physics Simulations",
                description:
                  "Explore the laws of physics through interactive simulations and experiments.",
                icon: <Atom className="h-8 w-8 text-cyan-500" />,
                color: "from-cyan-500/20 to-blue-500/20",
                width: "medium",
                height: "small",
                link: "/subjects/physics",
              },
              {
                title: "Biology Explorer",
                description:
                  "Dive into the world of living organisms with detailed models and explanations.",
                icon: <Dna className="h-8 w-8 text-green-500" />,
                color: "from-green-500/20 to-emerald-500/20",
                width: "medium",
                height: "small",
                link: "/subjects/biology",
              },
              {
                title: "Progress Tracking",
                description:
                  "Monitor your learning journey with detailed analytics and insights.",
                icon: <BarChart className="h-8 w-8 text-amber-500" />,
                color: "from-amber-500/20 to-yellow-500/20",
                width: "medium",
                height: "medium",
                link: "/features/progress",
              },
              {
                title: "Coding Playground",
                description:
                  "Learn programming concepts with an interactive coding environment.",
                icon: <Code className="h-8 w-8 text-indigo-500" />,
                color: "from-indigo-500/20 to-violet-500/20",
                width: "medium",
                height: "medium",
                link: "/features/coding",
              },
              {
                title: "Global Learning Community",
                description:
                  "Connect with learners from around the world to collaborate and share knowledge.",
                icon: <Globe className="h-8 w-8 text-blue-500" />,
                color: "from-blue-500/20 to-indigo-500/20",
                width: "large",
                height: "small",
                link: "/features/community",
              },
              {
                title: "Creative Arts",
                description:
                  "Explore music, visual arts, and creative expression with AI-guided tutorials.",
                icon: <Palette className="h-8 w-8 text-pink-500" />,
                color: "from-pink-500/20 to-rose-500/20",
                width: "medium",
                height: "small",
                link: "/subjects/arts",
              },
              {
                title: "Space Exploration",
                description:
                  "Journey through the cosmos with interactive astronomy lessons and simulations.",
                icon: <Rocket className="h-8 w-8 text-violet-500" />,
                color: "from-violet-500/20 to-purple-500/20",
                width: "medium",
                height: "small",
                link: "/subjects/astronomy",
              },
            ]}
          />
        </section>

        <section id="features" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>

          <div className="container relative z-10">
            <ScrollRevealSection animation="fade" className="text-center mb-16">
              <HeroText
                text="Revolutionary learning features"
                fontSize="5xl"
                className="mb-4"
              />
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with interactive
                experiences to make learning intuitive and engaging
              </p>
            </ScrollRevealSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {featureCards.map((card, index) => (
                <ScrollRevealSection
                  key={index}
                  animation="rise"
                  delay={index * 0.1}
                  className="h-full"
                >
                  <PerspectiveCard
                    className="h-full"
                    backgroundImage={card.image}
                    rotationIntensity={12}
                  >
                    <div
                      className={`${card.bgColor} p-8 rounded-xl text-white h-full bg-opacity-80 backdrop-blur-sm`}
                    >
                      <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                      <p className="text-white/90 mb-6">{card.description}</p>

                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/20 mt-auto"
                        asChild
                      >
                        <Link
                          href={`/features/${card.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <span className="flex items-center">
                            Learn more
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </PerspectiveCard>
                </ScrollRevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects section */}
        <section id="subjects" className="py-24 container">
          <ScrollRevealSection animation="fade" className="text-center mb-12">
            <HeroText
              text="Learn across subjects"
              fontSize="5xl"
              className="mb-4"
            />
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              From science and math to history and languages, our AI tutor can
              help you master any subject
            </p>
          </ScrollRevealSection>

          <div className="mt-16">
            <Tabs defaultValue="science" className="w-full">
              <ScrollRevealSection
                animation="slide"
                direction="up"
                className="flex justify-center mb-8"
              >
                <TabsList className="bg-background/50 border border-primary/10 p-1 rounded-full">
                  <TabsTrigger value="science" className="rounded-full px-6">
                    Science
                  </TabsTrigger>
                  <TabsTrigger value="math" className="rounded-full px-6">
                    Math
                  </TabsTrigger>
                  <TabsTrigger value="history" className="rounded-full px-6">
                    History
                  </TabsTrigger>
                  <TabsTrigger value="languages" className="rounded-full px-6">
                    Languages
                  </TabsTrigger>
                  <TabsTrigger value="coding" className="rounded-full px-6">
                    Coding
                  </TabsTrigger>
                </TabsList>
              </ScrollRevealSection>

              <div className="mt-8">
                <TabsContent value="science">
                  <ParallaxSection direction="up" speed={2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <GlareCard
                        className="p-8 h-full"
                        glareSize={300}
                        glareColor="rgba(120, 80, 255, 0.3)"
                        borderColor="rgba(120, 80, 255, 0.2)"
                      >
                        <h3 className="text-2xl font-bold mb-4">Biology</h3>
                        <p className="text-foreground/70 mb-6">
                          From cellular biology to ecosystems, learn how living
                          organisms function and interact with their
                          environment.
                        </p>
                        <div className="flex gap-2 flex-wrap mt-4">
                          {["Cells", "Genetics", "Anatomy", "Ecology"].map(
                            (tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      </GlareCard>

                      <GlareCard
                        className="p-8 h-full"
                        glareSize={300}
                        glareColor="rgba(80, 120, 255, 0.3)"
                        borderColor="rgba(80, 120, 255, 0.2)"
                      >
                        <h3 className="text-2xl font-bold mb-4">Chemistry</h3>
                        <p className="text-foreground/70 mb-6">
                          Explore the composition, structure, properties, and
                          reactions of substances with interactive models.
                        </p>
                        <div className="flex gap-2 flex-wrap mt-4">
                          {[
                            "Elements",
                            "Compounds",
                            "Reactions",
                            "Organic Chemistry",
                          ].map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </GlareCard>
                    </div>
                  </ParallaxSection>
                </TabsContent>

                {/* Other subject tabs would go here */}
                <TabsContent value="math">
                  <ParallaxSection direction="up" speed={2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <GlareCard
                        className="p-8 h-full"
                        glareSize={300}
                        glareColor="rgba(80, 160, 255, 0.3)"
                        borderColor="rgba(80, 160, 255, 0.2)"
                        animateGlare={true}
                        animationDuration={5}
                      >
                        <h3 className="text-2xl font-bold mb-4">Calculus</h3>
                        <p className="text-foreground/70 mb-6">
                          Master derivatives, integrals, and applications of
                          calculus with step-by-step explanations and visual
                          graphs.
                        </p>
                        <div className="flex gap-2 flex-wrap mt-4">
                          {[
                            "Limits",
                            "Derivatives",
                            "Integrals",
                            "Applications",
                          ].map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </GlareCard>

                      <GlareCard
                        className="p-8 h-full"
                        glareSize={300}
                        glareColor="rgba(120, 160, 80, 0.3)"
                        borderColor="rgba(120, 160, 80, 0.2)"
                        animateGlare={true}
                        animationDuration={6}
                      >
                        <h3 className="text-2xl font-bold mb-4">
                          Linear Algebra
                        </h3>
                        <p className="text-foreground/70 mb-6">
                          Understand vectors, matrices, and transformations with
                          interactive 3D visualizations and practical examples.
                        </p>
                        <div className="flex gap-2 flex-wrap mt-4">
                          {[
                            "Vectors",
                            "Matrices",
                            "Eigenvalues",
                            "Transformations",
                          ].map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </GlareCard>
                    </div>
                  </ParallaxSection>
                </TabsContent>

                {/* Additional tabs would be similar */}
              </div>
            </Tabs>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-blue-500/5"></div>

          <div className="container relative z-10">
            <ScrollRevealSection animation="fade" className="text-center mb-16">
              <HeroText
                text="Loved by students worldwide"
                fontSize="5xl"
                className="mb-4"
              />
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                Join thousands of students who are already learning faster and
                more effectively with Intellect
              </p>
            </ScrollRevealSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
              <div className="flex items-center justify-center">
                <CardStack
                  items={[
                    {
                      id: 1,
                      name: "Sarah Johnson",
                      designation: "Physics Student",
                      content: (
                        <p>
                          "Intellect helped me understand quantum mechanics in
                          ways my textbooks never could. The visualizations make
                          complex concepts so much clearer!"
                        </p>
                      ),
                    },
                    {
                      id: 2,
                      name: "Michael Lee",
                      designation: "Software Engineer",
                      content: (
                        <p>
                          "As someone learning machine learning, having an AI
                          that can explain algorithms visually has been a
                          game-changer. I'm learning twice as fast."
                        </p>
                      ),
                    },
                    {
                      id: 3,
                      name: "Emma Rodriguez",
                      designation: "Medical Student",
                      content: (
                        <p>
                          "Medical school is intense, but Intellect helps me
                          organize complex information and understand the
                          relationships between systems."
                        </p>
                      ),
                    },
                    {
                      id: 4,
                      name: "Tyler Durden",
                      designation: "Project Manager",
                      content: (
                        <p>
                          "The first rule of effective learning is to use
                          Intellect. The interactive approach helps me retain
                          information like never before."
                        </p>
                      ),
                    },
                    {
                      id: 5,
                      name: "Jane Smith",
                      designation: "High School Teacher",
                      content: (
                        <p>
                          "I recommend Intellect to all my students. It's like
                          having a personal tutor that's available 24/7 and
                          explains concepts perfectly."
                        </p>
                      ),
                    },
                  ]}
                />
              </div>

              <div className="flex flex-col justify-center space-y-6">
                <ScrollRevealSection animation="fade" delay={0.2}>
                  <h3 className="text-2xl font-bold mb-4">
                    Why students love us
                  </h3>
                  <ul className="space-y-4">
                    {[
                      "Personalized learning experience adapts to your needs",
                      "Visual explanations make complex topics easy to understand",
                      "Available 24/7 for learning at your own pace",
                      "Covers a wide range of subjects and topics",
                      "Continuous improvement based on student feedback",
                    ].map((point, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Sparkles className="h-5 w-5 text-primary mt-1 mr-2 flex-shrink-0" />
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </ScrollRevealSection>

                <MagnetButton
                  magneticIntensity={0.3}
                  glowOnHover={true}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg mt-6 self-start"
                >
                  <span className="flex items-center">
                    Join our community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </MagnetButton>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10"></div>

          <Spotlight autoMove={true} className="container max-w-4xl mx-auto">
            <ScrollRevealSection
              animation="scale"
              className="relative z-10 text-center"
            >
              <GlareCard
                className="p-12 rounded-3xl h-full"
                glareSize={600}
                glareColor="rgba(120, 80, 255, 0.4)"
                borderColor="rgba(120, 80, 255, 0.3)"
                backgroundColor="rgba(10, 10, 20, 0.3)"
                animateGlare={true}
                animationDuration={10}
              >
                <HeroText
                  text="Ready to transform your learning?"
                  fontSize="4xl"
                  className="mb-8"
                />

                <p className="text-xl text-foreground/80 mb-8 max-w-xl mx-auto">
                  Join thousands of students and professionals who are already
                  learning faster and more effectively with Intellect.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <MagnetButton
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
                    magneticIntensity={0.4}
                    glowOnHover={true}
                    onClick={() => router.push("/login?signup=true")}
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </MagnetButton>

                  <MagnetButton
                    variant="outlined"
                    size="lg"
                    className="border-primary/20 hover:bg-primary/5"
                    magneticIntensity={0.3}
                    onClick={() => router.push("/pricing")}
                  >
                    See pricing plans
                  </MagnetButton>
                </div>
              </GlareCard>
            </ScrollRevealSection>
          </Spotlight>
        </section>

        {/* Partners logos */}
        <section className="py-16 container">
          <ScrollRevealSection animation="fade" className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">
              Trusted by leading institutions
            </h3>
            <p className="text-foreground/70">
              Elite universities and educational platforms rely on our
              technology
            </p>
          </ScrollRevealSection>

          <InfiniteMovingCards
            items={[
              <div
                key="partner-1"
                className="w-48 h-20 flex items-center justify-center mx-8 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="bg-primary/20 w-full h-12 rounded-md flex items-center justify-center">
                  <span className="font-bold text-primary/70">
                    University X
                  </span>
                </div>
              </div>,
              <div
                key="partner-2"
                className="w-48 h-20 flex items-center justify-center mx-8 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="bg-primary/20 w-full h-12 rounded-md flex items-center justify-center">
                  <span className="font-bold text-primary/70">EdTech Co.</span>
                </div>
              </div>,
              <div
                key="partner-3"
                className="w-48 h-20 flex items-center justify-center mx-8 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="bg-primary/20 w-full h-12 rounded-md flex items-center justify-center">
                  <span className="font-bold text-primary/70">
                    Learning Inc
                  </span>
                </div>
              </div>,
              <div
                key="partner-4"
                className="w-48 h-20 flex items-center justify-center mx-8 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="bg-primary/20 w-full h-12 rounded-md flex items-center justify-center">
                  <span className="font-bold text-primary/70">Academy Z</span>
                </div>
              </div>,
              <div
                key="partner-5"
                className="w-48 h-20 flex items-center justify-center mx-8 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="bg-primary/20 w-full h-12 rounded-md flex items-center justify-center">
                  <span className="font-bold text-primary/70">College Y</span>
                </div>
              </div>,
              <div
                key="partner-6"
                className="w-48 h-20 flex items-center justify-center mx-8 opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="bg-primary/20 w-full h-12 rounded-md flex items-center justify-center">
                  <span className="font-bold text-primary/70">Tech School</span>
                </div>
              </div>,
            ]}
            speed={15}
            containerClassName="py-10"
          />
        </section>
      </main>
    </div>
  );
}

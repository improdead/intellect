import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="container py-12 md:py-24">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">Choose the plan that's right for your learning journey</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Free Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Basic</CardTitle>
            <CardDescription>Essential learning tools to get started</CardDescription>
            <div className="mt-4 flex items-baseline text-3xl font-bold">Free</div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {[
                "Access to AI tutor (5 questions/day)",
                "Basic subject coverage",
                "Standard response time",
                "Limited quiz access",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="flex flex-col border-primary">
          <CardHeader>
            <div className="mb-2 text-sm font-medium text-primary">Most Popular</div>
            <CardTitle>Pro</CardTitle>
            <CardDescription>Advanced learning for serious students</CardDescription>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {[
                "Unlimited AI tutor questions",
                "All subjects covered",
                "Priority response time",
                "Full quiz access",
                "Interactive simulations",
                "Progress tracking",
                "Personalized study plans",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/login">Subscribe Now</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Team Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>For schools and learning groups</CardDescription>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold">$19.99</span>
              <span className="text-muted-foreground">/user/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {[
                "All Pro features included",
                "Team management dashboard",
                "Collaborative learning tools",
                "Group progress analytics",
                "Custom curriculum integration",
                "Dedicated support",
                "API access",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              question: "Can I switch plans later?",
              answer:
                "Yes, you can upgrade or downgrade your plan at any time. Changes will be applied to your next billing cycle.",
            },
            {
              question: "Is there a student discount?",
              answer:
                "Yes, we offer a 50% discount for verified students. Contact our support team with your student ID for verification.",
            },
            {
              question: "How does the AI tutor work?",
              answer:
                "Our AI tutor uses advanced language models to provide personalized explanations, answer questions, and guide your learning journey.",
            },
            {
              question: "Can I cancel my subscription?",
              answer:
                "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.",
            },
            {
              question: "Do you offer a free trial?",
              answer:
                "Yes, all paid plans come with a 7-day free trial so you can experience the full features before committing.",
            },
            {
              question: "What subjects are covered?",
              answer:
                "We cover a wide range of subjects including Mathematics, Physics, Chemistry, Biology, and more, with new content added regularly.",
            },
          ].map((faq, i) => (
            <div key={i} className="rounded-lg border p-6">
              <h3 className="font-medium">{faq.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

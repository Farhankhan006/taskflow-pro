import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Loader2,
  Target,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "../components/layout/Layout";
import { useAuth } from "../hooks/use-auth";

const FEATURES = [
  { icon: CheckCircle2, text: "Smart task management with priorities" },
  { icon: BarChart3, text: "Productivity analytics & insights" },
  { icon: Target, text: "Goal tracking and habit streaks" },
];

export default function LoginPage() {
  const { login, isInitializing, isLoggingIn } = useAuth();
  const isLoading = isInitializing || isLoggingIn;

  return (
    <Layout showNav={false} showHeader={false}>
      {/* Hero gradient background */}
      <div className="relative min-h-screen flex flex-col gradient-hero overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-[-80px] w-72 h-72 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-[-40px] w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1 px-6 pt-16 pb-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground tracking-tight">
                TaskFlow <span className="gradient-text">Pro</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Smart Productivity
              </p>
            </div>
          </motion.div>

          {/* Main hero text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="mb-10"
          >
            <h2 className="font-display font-bold text-4xl leading-tight text-foreground mb-3">
              Your tasks, <span className="gradient-text">mastered.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Premium productivity for focused professionals. Manage tasks,
              track habits, and achieve goals with elegance.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-3 mb-12"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center gap-3 glass-sm rounded-2xl px-4 py-3"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground/80">{f.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-4"
          >
            <Button
              onClick={login}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl text-base font-semibold gradient-primary text-white shadow-glow transition-smooth active:scale-98 flex items-center justify-center gap-2"
              data-ocid="login_button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isInitializing ? "Loading…" : "Connecting…"}
                </>
              ) : (
                <>
                  Get Started with Internet Identity
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
              Secured by the Internet Computer. No passwords, no email — just
              your cryptographic identity.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

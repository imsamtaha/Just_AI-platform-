import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-orange-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center glow-orange">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="text-3xl font-black text-gradient">SAM AI</span>
          </div>
          <p className="text-white/40 text-sm">Create your free account and start building</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              card: "bg-[#0D0D0D] border border-white/10 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-white/50",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
              formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-orange-500",
              formFieldLabel: "text-white/70",
              formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white",
              footerActionLink: "text-orange-400 hover:text-orange-300",
              dividerLine: "bg-white/10",
              dividerText: "text-white/30",
            },
          }}
        />
      </div>
    </div>
  );
}

import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-10">
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
          CasalFin
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Comece agora
        </h1>
        <p className="text-sm text-muted-foreground">
          Crie sua conta e faça o primeiro upload em minutos.
        </p>
      </div>
      <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700 [animation-delay:120ms]">
        <AuthForm mode="signup" />
      </div>
      <p className="text-xs text-muted-foreground animate-in fade-in duration-700 [animation-delay:200ms]">
        Ao criar a conta, você concorda com os termos e a política de privacidade.
      </p>
    </div>
  );
}

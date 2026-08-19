import * as React from "react"
import { Sparkles, CheckCircle2, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ShadcnDemo() {
  const [count, setCount] = React.useState(0)

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-md">
      <CardHeader>
        <div className="flex items-center gap-2 text-yellow-400 font-mono text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          shadcn/ui + React 19 Active
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          shadcn/ui Integration
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Tailwind CSS v4 + React 19 interactive components running seamlessly in Astro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Configured Setup:
          </div>
          <ul className="text-xs text-zinc-400 space-y-1 pl-6 list-disc">
            <li><code className="text-yellow-300">@astrojs/react</code> integration</li>
            <li>Path alias (<code className="text-yellow-300">@/*</code>) mapping</li>
            <li>shadcn utilities (<code className="text-yellow-300">cn()</code> helper)</li>
            <li>Components installed in <code className="text-yellow-300">src/components/ui/</code></li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t border-zinc-800/60 pt-4">
        <div className="text-xs text-zinc-500 font-mono">
          Counter: <span className="text-white font-bold">{count}</span>
        </div>
        <Button 
          onClick={() => setCount((c) => c + 1)}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold shadow-lg transition-transform active:scale-95"
        >
          <Flame className="w-4 h-4 mr-1" />
          Test Component ({count})
        </Button>
      </CardFooter>
    </Card>
  )
}

import { n as __exportAll, t as createComponent } from "./compiler_BSRKz0BZ.mjs";
import { i as renderComponent, m as maybeRenderHead, u as renderTemplate } from "./server_DKvTTH34.mjs";
import { t as $$Layout } from "./Layout_Cyzszunp.mjs";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/lib/supabase.ts
var supabaseUrl = "https://xmlcrgqhyxzmxwzuyaum.supabase.co".trim();
var supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtbGNyZ3FoeXh6bXh3enV5YXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTk1NjIsImV4cCI6MjEwMjYzNTU2Mn0.vS4sKB2zk_ouaqm8ef_haigZEhvJ04fmcs3r6gMEwWs".trim();
var supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: {
	autoRefreshToken: true,
	persistSession: true,
	detectSessionInUrl: true,
	flowType: "pkce"
} });
//#endregion
//#region src/lib/adminAuth.ts
/**
* Signs in as admin using email and password
*/
async function adminSignIn(email, password) {
	try {
		const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password
		});
		if (authError || !authData.user) return {
			success: false,
			error: authError?.message || "Invalid credentials"
		};
		const user = authData.user;
		const { data: adminRow, error: adminErr } = await supabase.from("admin_users").select("id, email").eq("id", user.id).maybeSingle();
		if (!adminErr && !adminRow) {
			const { count } = await supabase.from("admin_users").select("*", {
				count: "exact",
				head: true
			});
			if (count !== null && count > 0) {
				await supabase.auth.signOut();
				return {
					success: false,
					error: "Access denied. This account does not have admin privileges."
				};
			}
		}
		return {
			success: true,
			user: {
				id: user.id,
				email: user.email || email
			}
		};
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Sign in failed"
		};
	}
}
/**
* Checks if current active session belongs to an admin
*/
async function getAdminSession() {
	try {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session || !session.user) return null;
		return {
			id: session.user.id,
			email: session.user.email || ""
		};
	} catch {
		return null;
	}
}
//#endregion
//#region src/components/admin/AdminLogin.tsx
var MAX_ATTEMPTS = 5;
var LOCKOUT_SECONDS = 60;
function AdminLogin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isChecking, setIsChecking] = useState(true);
	const [attempts, setAttempts] = useState(0);
	const [lockedUntil, setLockedUntil] = useState(null);
	const [countdown, setCountdown] = useState(0);
	const intervalRef = useRef(null);
	useEffect(() => {
		getAdminSession().then((session) => {
			if (session) window.location.href = "/admin/templates";
			else setIsChecking(false);
		});
	}, []);
	useEffect(() => {
		if (lockedUntil === null) return;
		const tick = () => {
			const remaining = Math.ceil((lockedUntil - Date.now()) / 1e3);
			if (remaining <= 0) {
				setLockedUntil(null);
				setAttempts(0);
				setCountdown(0);
				setError(null);
				if (intervalRef.current) clearInterval(intervalRef.current);
			} else setCountdown(remaining);
		};
		tick();
		intervalRef.current = setInterval(tick, 1e3);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [lockedUntil]);
	const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isLocked) return;
		setError(null);
		setLoading(true);
		try {
			const res = await adminSignIn(email, password);
			if (!res.success) {
				const newAttempts = attempts + 1;
				setAttempts(newAttempts);
				if (newAttempts >= MAX_ATTEMPTS) {
					const until = Date.now() + LOCKOUT_SECONDS * 1e3;
					setLockedUntil(until);
					setError(`Too many failed attempts. Please wait ${LOCKOUT_SECONDS} seconds before trying again.`);
				} else {
					const remaining = MAX_ATTEMPTS - newAttempts;
					setError(`${res.error || "Login failed."} ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
				}
				setLoading(false);
				return;
			}
			window.location.href = "/admin/templates";
		} catch (err) {
			setError(err?.message || "An unexpected error occurred.");
			setLoading(false);
		}
	};
	if (isChecking) return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-2 border-[#19bde7] border-t-transparent" })
	});
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-[80vh] items-center justify-center px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-md rounded-2xl border border-white/10 bg-[#202020] p-8 shadow-2xl",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "text-center mb-8",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#19bde7] text-black font-black text-xl",
							children: "M"
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold tracking-tight text-white",
							children: "Admin Portal"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-gray-400",
							children: "Sign in with your admin credentials to manage meme templates"
						})
					]
				}),
				error && /* @__PURE__ */ jsxs("div", {
					className: "mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400",
					children: [error, isLocked && countdown > 0 && /* @__PURE__ */ jsxs("span", {
						className: "ml-1 font-semibold",
						children: [
							"(",
							countdown,
							"s)"
						]
					})]
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5",
							children: "Admin Email"
						}), /* @__PURE__ */ jsx("input", {
							type: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value),
							disabled: isLocked,
							placeholder: "admin@mememaker.com",
							className: "w-full rounded-lg border border-white/15 bg-[#151515] px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#19bde7] transition-colors disabled:opacity-40"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5",
							children: "Password"
						}), /* @__PURE__ */ jsx("input", {
							type: "password",
							required: true,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							disabled: isLocked,
							placeholder: "••••••••••••",
							className: "w-full rounded-lg border border-white/15 bg-[#151515] px-3.5 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#19bde7] transition-colors disabled:opacity-40"
						})] }),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: loading || isLocked,
							className: "w-full mt-2 rounded-lg bg-[#19bde7] px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#15a8cf] disabled:opacity-50",
							children: loading ? "Verifying..." : isLocked ? `Locked — wait ${countdown}s` : "Sign In to Admin Panel"
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6 border-t border-white/10 pt-4 text-center",
					children: /* @__PURE__ */ jsx("a", {
						href: "/edit",
						className: "text-xs text-gray-500 hover:text-gray-300 transition-colors",
						children: "← Back to Public Editor"
					})
				})
			]
		})
	});
}
//#endregion
//#region src/pages/admin/login.astro
var login_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Login,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
var $$Login = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Admin Login — MemeMaker",
		"showFooter": false
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main class="py-12">${renderComponent($$result, "AdminLogin", AdminLogin, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/bombermac/projectVAS/MemeMaker/src/components/admin/AdminLogin.tsx",
		"client:component-export": "default"
	})}</main>` })}`;
}, "/Users/bombermac/projectVAS/MemeMaker/src/pages/admin/login.astro", void 0);
var $$file = "/Users/bombermac/projectVAS/MemeMaker/src/pages/admin/login.astro";
var $$url = "/admin/login";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/login@_@astro
var page = () => login_exports;
//#endregion
export { page };

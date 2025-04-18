import { SettingsView } from "@/components/settings/settings-view"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container px-4 py-8 pb-20 md:pb-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Settings</h1>
        <SettingsView />
      </div>
    </main>
  )
}


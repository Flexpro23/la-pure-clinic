"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useFirebase } from "@/contexts/firebase-context"
import { collection, getDocs, query, orderBy } from "firebase/firestore"

interface ClientData {
  id: string
  name: string
  age: number | null
  email?: string
  phoneNumber?: string
  frontImageUrl: string
  createdAt: string
}

export default function SimulationHistory() {
  const { t } = useLanguage()
  const router = useRouter()
  const { db, user } = useFirebase()
  const [clients, setClients] = useState<ClientData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const clientsRef = collection(db, "clients")
        // Simplified query that doesn't require composite index
        const q = query(
          clientsRef,
          orderBy("createdAt", "desc")
        )
        
        const querySnapshot = await getDocs(q)
        const clientsData: ClientData[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          clientsData.push({
            id: doc.id,
            name: data.name || "Unnamed Client",
            age: data.age || null,
            email: data.emailAddress || "",
            phoneNumber: data.phoneNumber || "",
            frontImageUrl: data.frontImageUrl || "/placeholder.svg",
            createdAt: data.createdAt || "",
          })
        })
        
        setClients(clientsData)
      } catch (error) {
        console.error("Error fetching clients:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchClients()
  }, [db])

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Simulation History</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="search"
                placeholder="Search clients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-lg p-4 h-48"></div>
              ))}
            </div>
          ) : filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No simulation records found.</p>
              <Button
                asChild
                variant="outline"
                className="mt-4"
              >
                <Link href="/dashboard/new-simulation">Create New Simulation</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ClientCard({ client }: { client: ClientData }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200">
            <Image
              src={client.frontImageUrl || "/placeholder.svg"}
              alt={client.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-slate-900">{client.name}</h3>
          <p className="text-sm text-slate-500">
            Age: {client.age || "N/A"}
          </p>
          <p className="text-sm text-slate-700 mt-1">{client.email}</p>
          <p className="text-sm text-slate-700">{client.phoneNumber}</p>
          <Button 
            asChild
            variant="outline" 
            className="w-full mt-3"
            size="sm"
          >
            <Link href={`/dashboard/${client.id}/report`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/components/auth/AuthProvider'
import {
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Plus,
  Star,
  Edit,
  Trash2
} from 'lucide-react'

interface Lead {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  company_name: string | null
  title: string | null
  source: string | null
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost'
  score: number
  value: number | null
  notes: string | null
  tags: string[] | null
  created_at: string
  assigned_to?: {
    first_name: string | null
    last_name: string | null
  }
}

const statusColors = {
  new: 'secondary',
  contacted: 'default',
  qualified: 'default',
  unqualified: 'outline',
  lost: 'destructive'
} as const

const statusLabels = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  unqualified: 'Unqualified',
  lost: 'Lost'
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    title: '',
    source: '',
    status: 'new' as 'new' | 'contacted' | 'qualified' | 'unqualified' | 'lost',
    value: '',
    notes: ''
  })

  const { profile } = useAuthContext()
  const { toast } = useToast()

  useEffect(() => {
    fetchLeads()
  }, [profile])

  const fetchLeads = async () => {
    if (!profile?.company_id) return

    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_to:profiles(first_name, last_name)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch leads',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.company_id) return

    try {
      const leadData = {
        ...formData,
        company_id: profile.company_id,
        assigned_to: profile.id,
        value: formData.value ? parseFloat(formData.value) : null
      }

      if (selectedLead) {
        const { error } = await supabase
          .from('leads')
          .update(leadData)
          .eq('id', selectedLead.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Lead updated successfully'
        })
      } else {
        const { error } = await supabase
          .from('leads')
          .insert([leadData])

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Lead created successfully'
        })
      }

      setIsAddDialogOpen(false)
      setSelectedLead(null)
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        title: '',
        source: '',
        status: 'new',
        value: '',
        notes: ''
      })
      fetchLeads()
    } catch (error) {
      console.error('Error saving lead:', error)
      toast({
        title: 'Error',
        description: 'Failed to save lead',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    setFormData({
      first_name: lead.first_name,
      last_name: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company_name: lead.company_name || '',
      title: lead.title || '',
      source: lead.source || '',
      status: lead.status,
      value: lead.value?.toString() || '',
      notes: lead.notes || ''
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Lead deleted successfully'
      })
      fetchLeads()
    } catch (error) {
      console.error('Error deleting lead:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive'
      })
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedLead ? 'Edit Lead' : 'Add New Lead'}
              </DialogTitle>
              <DialogDescription>
                {selectedLead ? 'Update lead information' : 'Create a new lead in your pipeline'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="cold_call">Cold Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="unqualified">Unqualified</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Potential Value</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="0.00"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedLead ? 'Update Lead' : 'Create Lead'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="unqualified">Unqualified</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {lead.first_name.charAt(0)}
                      {lead.last_name?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {lead.first_name} {lead.last_name}
                    </CardTitle>
                    <CardDescription>{lead.title}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={statusColors[lead.status]}>
                    {statusLabels[lead.status]}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(lead)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(lead.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {lead.company_name && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4 mr-2" />
                  {lead.company_name}
                </div>
              )}
              
              {lead.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  {lead.email}
                </div>
              )}
              
              {lead.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  {lead.phone}
                </div>
              )}

              {lead.value && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Potential Value:</span>
                  <span className="font-medium text-success">
                    ${lead.value.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lead Score:</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-warning mr-1" />
                  <span className="font-medium">{lead.score}</span>
                </div>
              </div>

              {lead.assigned_to && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assigned to:</span>
                  <span className="font-medium">
                    {lead.assigned_to.first_name} {lead.assigned_to.last_name}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first lead'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Lead
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
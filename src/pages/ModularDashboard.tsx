import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, LayoutGrid, Filter, Download, RefreshCw } from "lucide-react";
import { DashboardWidget } from "@/components/modular/DashboardWidget";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  metrics: {
    totalLeads: number;
    totalDeals: number;
    totalRevenue: number;
    conversionRate: number;
    leadsChange: number;
    dealsChange: number;
    revenueChange: number;
  };
  recentActivities: any[];
  topDeals: any[];
  leadsBreakdown: any[];
}

export default function ModularDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const { profile } = useAuthContext();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load basic metrics
      const [leadsRes, dealsRes] = await Promise.all([
        supabase
          .from('leads')
          .select('*')
          .eq('company_id', profile?.company_id),
        supabase
          .from('deals')
          .select('*')
          .eq('company_id', profile?.company_id)
      ]);

      const leads = leadsRes.data || [];
      const deals = dealsRes.data || [];

      const totalRevenue = deals
        .filter(deal => deal.stage_id && deals.some(d => d.actual_close_date))
        .reduce((sum, deal) => sum + (deal.value || 0), 0);

      const conversionRate = leads.length > 0 
        ? (leads.filter(lead => lead.status === 'closed_won').length / leads.length) * 100 
        : 0;

      // Mock recent activities
      const recentActivities = [
        { id: '1', title: 'New lead created', description: 'John Doe created a new lead', time: 'Today' },
        { id: '2', title: 'Deal updated', description: 'Jane Smith updated a deal', time: 'Yesterday' },
        { id: '3', title: 'Contact added', description: 'Mike Johnson added a contact', time: '2 days ago' }
      ];

      // Top deals
      const topDeals = deals
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .slice(0, 5)
        .map(deal => ({
          title: deal.title,
          subtitle: `$${(deal.value || 0).toLocaleString()}`,
          value: `${deal.probability}%`
        }));

      // Leads breakdown
      const leadsBreakdown = [
        { title: 'New Leads', subtitle: 'This week', value: leads.filter(l => l.status === 'new').length },
        { title: 'Qualified', subtitle: 'Ready for sales', value: leads.filter(l => l.status === 'qualified').length },
        { title: 'Contacted', subtitle: 'In progress', value: leads.filter(l => l.status === 'contacted').length },
        { title: 'Closed Won', subtitle: 'Successful', value: leads.filter(l => l.status === 'closed_won').length },
      ];

      setDashboardData({
        metrics: {
          totalLeads: leads.length,
          totalDeals: deals.length,
          totalRevenue,
          conversionRate,
          leadsChange: 15.2, // Mock data
          dealsChange: 8.7,  // Mock data
          revenueChange: 23.1 // Mock data
        },
        recentActivities,
        topDeals,
        leadsBreakdown
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Default widget configuration
  const defaultWidgets = [
    {
      id: 'leads-metric',
      title: 'Total Leads',
      type: 'metric' as const,
      size: 'sm' as const,
      data: {
        label: 'Leads',
        value: dashboardData?.metrics.totalLeads || 0,
        change: dashboardData?.metrics.leadsChange || 0,
        subtitle: 'This month'
      }
    },
    {
      id: 'deals-metric',
      title: 'Active Deals',
      type: 'metric' as const,
      size: 'sm' as const,
      data: {
        label: 'Deals',
        value: dashboardData?.metrics.totalDeals || 0,
        change: dashboardData?.metrics.dealsChange || 0,
        subtitle: 'In pipeline'
      }
    },
    {
      id: 'revenue-metric',
      title: 'Total Revenue',
      type: 'metric' as const,
      size: 'sm' as const,
      data: {
        label: 'Revenue',
        value: `$${(dashboardData?.metrics.totalRevenue || 0).toLocaleString()}`,
        change: dashboardData?.metrics.revenueChange || 0,
        subtitle: 'This quarter'
      }
    },
    {
      id: 'conversion-metric',
      title: 'Conversion Rate',
      type: 'metric' as const,
      size: 'sm' as const,
      data: {
        label: 'Conversion',
        value: `${(dashboardData?.metrics.conversionRate || 0).toFixed(1)}%`,
        change: 2.3,
        subtitle: 'Lead to deal'
      }
    },
    {
      id: 'top-deals',
      title: 'Top Deals',
      type: 'list' as const,
      size: 'md' as const,
      data: {
        items: dashboardData?.topDeals || []
      }
    },
    {
      id: 'recent-activity',
      title: 'Recent Activity',
      type: 'activity' as const,
      size: 'md' as const,
      data: {
        activities: dashboardData?.recentActivities || []
      }
    },
    {
      id: 'leads-breakdown',
      title: 'Leads Breakdown',
      type: 'list' as const,
      size: 'md' as const,
      data: {
        items: dashboardData?.leadsBreakdown || []
      }
    },
    {
      id: 'sales-chart',
      title: 'Sales Trend',
      type: 'chart' as const,
      size: 'lg' as const,
      data: {
        type: 'line',
        datasets: []
      }
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name}! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant={editMode ? "default" : "outline"} 
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {editMode ? "Done" : "Customize"}
          </Button>
        </div>
      </div>

      {editMode && (
        <Card className="mb-6 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LayoutGrid className="w-5 h-5" />
                <div>
                  <p className="font-medium">Dashboard Customization</p>
                  <p className="text-sm text-muted-foreground">
                    Drag widgets to rearrange, click to edit, or add new widgets
                  </p>
                </div>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
        {defaultWidgets.map(widget => (
          <DashboardWidget
            key={widget.id}
            widget={widget}
            isEditable={editMode}
            onEdit={(id) => console.log('Edit widget:', id)}
            onRemove={(id) => console.log('Remove widget:', id)}
            onRefresh={(id) => loadDashboardData()}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-sm">Add Lead</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-sm">Create Deal</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-sm">New Contact</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-sm">Send Invoice</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month's Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Lead Generation</span>
              <Badge variant="outline">85%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Revenue Target</span>
              <Badge variant="outline">67%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Customer Satisfaction</span>
              <Badge variant="default">94%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sales Team</span>
              <Badge variant="default">Excellent</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Support Team</span>
              <Badge variant="default">Good</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Marketing Team</span>
              <Badge variant="outline">Average</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge variant="default">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response</span>
              <Badge variant="default">Fast</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Integrations</span>
              <Badge variant="outline">2 Issues</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
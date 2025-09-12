import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Target,
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  FileText,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    name: "Total Leads",
    value: "1,234",
    change: "+12%",
    changeType: "increase",
    icon: UserPlus,
    color: "leads",
  },
  {
    name: "Active Opportunities",
    value: "89",
    change: "+8%",
    changeType: "increase", 
    icon: Target,
    color: "opportunities",
  },
  {
    name: "Total Customers",
    value: "456",
    change: "+23%",
    changeType: "increase",
    icon: Users,
    color: "customers",
  },
  {
    name: "Monthly Revenue",
    value: "$125,430",
    change: "+15%",
    changeType: "increase",
    icon: DollarSign,
    color: "revenue",
  },
];

const recentLeads = [
  {
    name: "Sarah Johnson",
    company: "TechCorp Inc.",
    email: "sarah@techcorp.com",
    phone: "+1 (555) 123-4567",
    status: "qualified",
    value: "$45,000",
    source: "Website",
  },
  {
    name: "Michael Chen",
    company: "DataFlow Systems",
    email: "m.chen@dataflow.com",
    phone: "+1 (555) 987-6543",
    status: "new",
    value: "$32,000",
    source: "Referral",
  },
  {
    name: "Emily Rodriguez",
    company: "CloudTech Solutions",
    email: "emily@cloudtech.com",
    phone: "+1 (555) 456-7890",
    status: "contacted",
    value: "$67,500",
    source: "LinkedIn",
  },
];

const upcomingTasks = [
  {
    title: "Follow up with TechCorp Inc.",
    type: "call",
    time: "10:30 AM",
    priority: "high",
  },
  {
    title: "Send proposal to DataFlow Systems",
    type: "email",
    time: "2:00 PM",
    priority: "medium",
  },
  {
    title: "Demo meeting with CloudTech",
    type: "meeting",
    time: "4:30 PM",
    priority: "high",
  },
];

const pipelineStages = [
  { name: "Qualified", count: 12, value: "$234,000", percentage: 85 },
  { name: "Proposal", count: 8, value: "$156,000", percentage: 65 },
  { name: "Negotiation", count: 5, value: "$87,500", percentage: 45 },
  { name: "Closing", count: 3, value: "$45,000", percentage: 25 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
          <Button variant="outline">Generate Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                <stat.icon className={`h-4 w-4 text-${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.changeType === "increase" ? (
                  <ArrowUpRight className="h-3 w-3 text-success mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
                )}
                <span
                  className={
                    stat.changeType === "increase" ? "text-success" : "text-destructive"
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Sales Pipeline
            </CardTitle>
            <CardDescription>
              Track your deals through each stage of the sales process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineStages.map((stage) => (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">
                      {stage.count} deals
                    </span>
                    <span className="font-medium">{stage.value}</span>
                  </div>
                </div>
                <Progress value={stage.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Tasks
            </CardTitle>
            <CardDescription>Your scheduled activities for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  {task.type === "call" && <Phone className="w-4 h-4 text-info" />}
                  {task.type === "email" && <Mail className="w-4 h-4 text-warning" />}
                  {task.type === "meeting" && <Users className="w-4 h-4 text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">{task.time}</span>
                    <Badge
                      variant={task.priority === "high" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Recent Leads
          </CardTitle>
          <CardDescription>Latest prospects that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Value</th>
                  <th className="pb-3">Source</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLeads.map((lead, index) => (
                  <tr key={index} className="text-sm">
                    <td className="py-4">
                      <div>
                        <div className="font-medium text-foreground">{lead.name}</div>
                        <div className="text-muted-foreground">{lead.email}</div>
                        <div className="text-muted-foreground">{lead.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 text-foreground">{lead.company}</td>
                    <td className="py-4">
                      <Badge
                        variant={
                          lead.status === "qualified"
                            ? "default"
                            : lead.status === "new"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-4 font-medium text-foreground">{lead.value}</td>
                    <td className="py-4 text-muted-foreground">{lead.source}</td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
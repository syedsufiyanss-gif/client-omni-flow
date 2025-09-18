import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit3, Eye, BarChart3, Users, Target, DollarSign, TrendingUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface WidgetData {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'activity';
  size: 'sm' | 'md' | 'lg' | 'xl';
  data: any;
  refreshInterval?: number;
  permissions?: string[];
}

interface DashboardWidgetProps {
  widget: WidgetData;
  onEdit?: (widgetId: string) => void;
  onRemove?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
  isEditable?: boolean;
}

const getWidgetIcon = (type: string) => {
  switch (type) {
    case 'metric': return <BarChart3 className="w-5 h-5" />;
    case 'chart': return <TrendingUp className="w-5 h-5" />;
    case 'list': return <Users className="w-5 h-5" />;
    case 'activity': return <Target className="w-5 h-5" />;
    default: return <BarChart3 className="w-5 h-5" />;
  }
};

const MetricWidget = ({ data }: { data: any }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-muted-foreground">{data.label}</p>
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold">{data.value}</span>
        {data.change && (
          <Badge variant={data.change > 0 ? "default" : "destructive"} className="text-xs">
            {data.change > 0 ? '+' : ''}{data.change}%
          </Badge>
        )}
      </div>
      {data.subtitle && (
        <p className="text-xs text-muted-foreground">{data.subtitle}</p>
      )}
    </div>
    <div className="text-primary">
      <DollarSign className="w-8 h-8" />
    </div>
  </div>
);

const ListWidget = ({ data }: { data: any }) => (
  <div className="space-y-2">
    {data.items?.slice(0, 5).map((item: any, index: number) => (
      <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
        <div>
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
        </div>
        {item.value && (
          <Badge variant="outline">{item.value}</Badge>
        )}
      </div>
    ))}
    {data.items?.length > 5 && (
      <p className="text-xs text-center text-muted-foreground">
        +{data.items.length - 5} more items
      </p>
    )}
  </div>
);

const ActivityWidget = ({ data }: { data: any }) => (
  <div className="space-y-3">
    {data.activities?.slice(0, 4).map((activity: any, index: number) => (
      <div key={index} className="flex space-x-3">
        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{activity.title}</p>
          <p className="text-xs text-muted-foreground">{activity.description}</p>
          <p className="text-xs text-muted-foreground">{activity.time}</p>
        </div>
      </div>
    ))}
  </div>
);

export function DashboardWidget({ 
  widget, 
  onEdit, 
  onRemove, 
  onRefresh, 
  isEditable = false 
}: DashboardWidgetProps) {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'metric':
        return <MetricWidget data={widget.data} />;
      case 'list':
        return <ListWidget data={widget.data} />;
      case 'activity':
        return <ActivityWidget data={widget.data} />;
      case 'chart':
        return (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            <TrendingUp className="w-8 h-8" />
            <span className="ml-2">Chart placeholder</span>
          </div>
        );
      default:
        return <div className="p-4 text-center text-muted-foreground">No data</div>;
    }
  };

  const sizeClasses = {
    sm: "col-span-1 row-span-1",
    md: "col-span-2 row-span-1", 
    lg: "col-span-2 row-span-2",
    xl: "col-span-3 row-span-2"
  };

  return (
    <Card className={`${sizeClasses[widget.size]} transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          {getWidgetIcon(widget.type)}
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        </div>
        <div className="flex items-center space-x-1">
          {widget.refreshInterval && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onRefresh?.(widget.id)}
            >
              <Eye className="w-3 h-3" />
            </Button>
          )}
          {isEditable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(widget.id)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Widget
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRemove?.(widget.id)}
                  className="text-destructive"
                >
                  Remove Widget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MoreVertical, DollarSign, Calendar, User, Building2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  probability: number;
  expected_close_date?: string;
  stage_id: string;
  account?: {
    id: string;
    name: string;
  };
  primary_contact?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
  default_probability: number;
  is_won: boolean;
  is_lost: boolean;
  stage_color: string;
}

interface Pipeline {
  id: string;
  name: string;
  is_default: boolean;
  stages: PipelineStage[];
}

export function DealsKanban() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthContext();

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    if (activePipeline) {
      loadDeals();
    }
  }, [activePipeline]);

  const loadPipelines = async () => {
    try {
      const { data: pipelinesData, error } = await supabase
        .from('pipelines')
        .select(`
          *,
          pipeline_stages (*)
        `)
        .eq('company_id', profile?.company_id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedPipelines = pipelinesData?.map(pipeline => ({
        ...pipeline,
        stages: pipeline.pipeline_stages?.sort((a, b) => a.order_index - b.order_index) || []
      })) || [];

      setPipelines(formattedPipelines);
      
      // Set default pipeline or first one
      const defaultPipeline = formattedPipelines.find(p => p.is_default) || formattedPipelines[0];
      setActivePipeline(defaultPipeline);
    } catch (error) {
      console.error('Error loading pipelines:', error);
      toast.error('Failed to load pipelines');
    }
  };

  const loadDeals = async () => {
    if (!activePipeline) return;

    try {
      setLoading(true);
      const { data: dealsData, error } = await supabase
        .from('deals')
        .select(`
          *,
          accounts!deals_account_id_fkey (id, name),
          contacts!deals_primary_contact_id_fkey (id, first_name, last_name),
          profiles!deals_owner_id_fkey (id, first_name, last_name)
        `)
        .eq('company_id', profile?.company_id)
        .eq('pipeline_id', activePipeline.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDeals = dealsData?.map(deal => ({
        ...deal,
        account: deal.accounts,
        primary_contact: deal.contacts,
        owner: deal.profiles
      })) || [];

      setDeals(formattedDeals);
    } catch (error) {
      console.error('Error loading deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage_id === stageId);
  };

  const getStageTotal = (stageId: string) => {
    const stageDeals = getDealsByStage(stageId);
    return stageDeals.reduce((total, deal) => total + (deal.value || 0), 0);
  };

  const moveDeal = async (dealId: string, newStageId: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ 
          stage_id: newStageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealId);

      if (error) throw error;

      // Update local state
      setDeals(prev => prev.map(deal => 
        deal.id === dealId ? { ...deal, stage_id: newStageId } : deal
      ));

      toast.success('Deal moved successfully');
    } catch (error) {
      console.error('Error moving deal:', error);
      toast.error('Failed to move deal');
    }
  };

  const DealCard = ({ deal }: { deal: Deal }) => {
    const isOverdue = deal.expected_close_date && new Date(deal.expected_close_date) < new Date();
    
    return (
      <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow bg-background border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1 truncate">{deal.title}</h4>
              {deal.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {deal.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                <DropdownMenuItem>Clone Deal</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                <span className="font-medium">
                  {formatCurrency(deal.value, deal.currency)}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {deal.probability}%
              </Badge>
            </div>

            {deal.account && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Building2 className="w-3 h-3 mr-1" />
                <span className="truncate">{deal.account.name}</span>
              </div>
            )}

            {deal.primary_contact && (
              <div className="flex items-center text-xs text-muted-foreground">
                <User className="w-3 h-3 mr-1" />
                <span className="truncate">
                  {deal.primary_contact.first_name} {deal.primary_contact.last_name}
                </span>
              </div>
            )}

            {deal.expected_close_date && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 mr-1" />
                <span className={isOverdue ? "text-destructive font-medium" : ""}>
                  {new Date(deal.expected_close_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {deal.owner && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-xs">
                      {deal.owner.first_name?.[0]}{deal.owner.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {deal.owner.first_name} {deal.owner.last_name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const StageColumn = ({ stage }: { stage: PipelineStage }) => {
    const stageDeals = getDealsByStage(stage.id);
    const stageTotal = getStageTotal(stage.id);
    
    return (
      <div className="flex-1 min-w-80 max-w-96">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.stage_color }}
                />
                <CardTitle className="text-sm font-medium">
                  {stage.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {stageDeals.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Total: {formatCurrency(stageTotal)}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-96">
            <div className="space-y-3">
              {stageDeals.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
              {stageDeals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No deals in this stage
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading deals...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground">
            Manage your deals through the sales process
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {pipelines.length > 1 && (
            <select
              value={activePipeline?.id || ''}
              onChange={(e) => {
                const pipeline = pipelines.find(p => p.id === e.target.value);
                setActivePipeline(pipeline || null);
              }}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {pipelines.map(pipeline => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
          )}
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {activePipeline && (
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {activePipeline.stages.map(stage => (
            <StageColumn key={stage.id} stage={stage} />
          ))}
        </div>
      )}

      {!activePipeline && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No pipelines found</p>
          <Button>Create Your First Pipeline</Button>
        </div>
      )}
    </div>
  );
}
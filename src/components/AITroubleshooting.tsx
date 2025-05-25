// src/components/AITroubleshooting.tsx
"use client";

import { useState } from 'react';
import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { troubleshootHardwareMalfunction, TroubleshootHardwareMalfunctionOutput } from '@/ai/flows/troubleshoot-hardware-malfunctions';
import { suggestOptimalSolutions, SuggestOptimalSolutionsOutput } from '@/ai/flows/suggest-optimal-solutions';
import { AlertCircle, CheckCircle, Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AITroubleshootingProps {
  task: Task;
}

type AIResult = (TroubleshootHardwareMalfunctionOutput & { type: 'troubleshoot' }) | (SuggestOptimalSolutionsOutput & { type: 'solutions' });

export function AITroubleshooting({ task }: AITroubleshootingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTroubleshoot = async () => {
    setIsLoading(true);
    setError(null);
    setAiResult(null);
    try {
      const result = await troubleshootHardwareMalfunction({ problemDescription: task.problemDescription });
      setAiResult({ ...result, type: 'troubleshoot' });
    } catch (err) {
      console.error("AI Troubleshooting Error:", err);
      setError("Failed to get troubleshooting suggestions. Please try again.");
    }
    setIsLoading(false);
  };

  const handleSuggestSolutions = async () => {
    setIsLoading(true);
    setError(null);
    setAiResult(null);
    try {
      const result = await suggestOptimalSolutions({ ticketDescription: task.problemDescription });
      setAiResult({ ...result, type: 'solutions' });
    } catch (err) {
      console.error("AI Suggest Solutions Error:", err);
      setError("Failed to get optimal solutions. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-6 w-6 mr-2 text-primary" />
          AI-Powered Assistance
        </CardTitle>
        <CardDescription>
          Get intelligent suggestions for diagnosing and resolving the hardware issue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button onClick={handleTroubleshoot} disabled={isLoading} className="flex-1">
            {isLoading && aiResult?.type !== 'troubleshoot' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertCircle className="mr-2 h-4 w-4" />}
            Suggest Root Causes
          </Button>
          <Button onClick={handleSuggestSolutions} disabled={isLoading} className="flex-1">
            {isLoading && aiResult?.type !== 'solutions' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Suggest Optimal Solutions
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Generating suggestions...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {aiResult && !isLoading && (
          <Accordion type="single" collapsible className="w-full mt-4" defaultValue="item-0">
            {aiResult.type === 'troubleshoot' && (
              <>
                <AccordionItem value="item-0">
                  <AccordionTrigger className="text-lg font-semibold">Possible Root Causes</AccordionTrigger>
                  <AccordionContent>
                    {aiResult.possibleRootCauses.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {aiResult.possibleRootCauses.map((cause, index) => (
                          <li key={`cause-${index}`}>{cause}</li>
                        ))}
                      </ul>
                    ) : <p className="text-muted-foreground">No specific root causes suggested.</p>}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold">Suggested Solutions</AccordionTrigger>
                  <AccordionContent>
                     {aiResult.suggestedSolutions.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {aiResult.suggestedSolutions.map((solution, index) => (
                          <li key={`solution-${index}`}>{solution}</li>
                        ))}
                      </ul>
                    ): <p className="text-muted-foreground">No specific solutions suggested.</p>}
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
            {aiResult.type === 'solutions' && (
              <>
                <AccordionItem value="item-0">
                  <AccordionTrigger className="text-lg font-semibold">Suggested Optimal Solutions</AccordionTrigger>
                  <AccordionContent>
                    {aiResult.suggestedSolutions.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {aiResult.suggestedSolutions.map((solution, index) => (
                          <li key={`optimal-solution-${index}`}>{solution}</li>
                        ))}
                      </ul>
                    ) : <p className="text-muted-foreground">No specific optimal solutions suggested.</p>}
                  </AccordionContent>
                </AccordionItem>
                {aiResult.reasoning && (
                   <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">Reasoning</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground whitespace-pre-line">{aiResult.reasoning}</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

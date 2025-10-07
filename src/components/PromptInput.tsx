import { Sparkles } from 'lucide-react';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function PromptInput({ value, onChange, onGenerate, isGenerating }: PromptInputProps) {
  const maxLength = 500;
  const characterCount = value.length;

  return (
    <Card className="w-full">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 rounded-full bg-sage-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-sage-800 mb-2">Prompt</h3>
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Create a captivating video that seamlessly transitions between impressive frames, highlighting subtle movements and vivid colors. Emphasize fluid storytelling with dynamic..."
              rows={3}
              maxLength={maxLength}
              className="resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-sage-600">
                {characterCount}/{maxLength}
              </span>
              <Button
                onClick={onGenerate}
                disabled={isGenerating || !value.trim()}
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Cpu, Wrench, Building, Beaker, Database, Bot, Microscope } from "lucide-react";

export type ExpertField = 
  | 'software_engineering'
  | 'electrical_engineering'
  | 'mechanical_engineering'
  | 'civil_engineering'
  | 'chemical_engineering'
  | 'data_science'
  | 'robotics'
  | 'ai_ml';

interface ExpertSelectorProps {
  value?: ExpertField;
  onChange: (field: ExpertField) => void;
}

const expertOptions = [
  { value: 'software_engineering', label: 'Software Engineer', icon: Cpu },
  { value: 'electrical_engineering', label: 'Electrical Engineer', icon: Brain },
  { value: 'mechanical_engineering', label: 'Mechanical Engineer', icon: Wrench },
  { value: 'civil_engineering', label: 'Civil Engineer', icon: Building },
  { value: 'chemical_engineering', label: 'Chemical Engineer', icon: Beaker },
  { value: 'data_science', label: 'Data Scientist', icon: Database },
  { value: 'robotics', label: 'Robotics Expert', icon: Bot },
  { value: 'ai_ml', label: 'AI/ML Specialist', icon: Microscope },
];

export function ExpertSelector({ value, onChange }: ExpertSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Expert</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose an expert..." />
        </SelectTrigger>
        <SelectContent>
          {expertOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

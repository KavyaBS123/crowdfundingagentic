import React from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomFormFieldProps {
  form: any;
  name: string;
  labelText: string;
  placeholder: string;
  isTextArea?: boolean;
  isSelect?: boolean;
  options?: { label: string; value: string }[];
  description?: string;
}

const CustomFormField = ({
  form,
  name,
  labelText,
  placeholder,
  isTextArea = false,
  isSelect = false,
  options = [],
  description,
}: CustomFormFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="mb-4">
          <FormLabel className="font-medium">{labelText}</FormLabel>
          <FormControl>
            {isTextArea ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                className="resize-none bg-gray-100 dark:bg-gray-800 border-none rounded-lg"
              />
            ) : isSelect ? (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                {...field}
                placeholder={placeholder}
                className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg"
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Kbd } from "./kbd";

interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  showSearchIcon?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      className,
      suggestions = [],
      onSuggestionSelect,
      showSearchIcon = false,
      iconLeft,
      iconRight,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(props.value || "");
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [highlighted, setHighlighted] = useState<string | null>(null);
    const [tabPressed, setTabPressed] = useState(false);

    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergedRef(ref, inputRef);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setSelectedIndex(-1);
      props.onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!suggestions.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (i) => (i - 1 + suggestions.length) % suggestions.length
          );
          break;
        case "Enter":
          if (selectedIndex >= 0) {
            e.preventDefault();
            const selected = suggestions[selectedIndex];
            setValue(selected);
            onSuggestionSelect?.(selected);
          }
          break;
        case "Tab":
          if (highlighted) {
            e.preventDefault();
            setValue(highlighted);
            onSuggestionSelect?.(highlighted);
            setTabPressed(true);
            setTimeout(() => setTabPressed(false), 300);
          }
          break;
        case "Escape":
          inputRef.current?.blur();
          break;
      }

      props.onKeyDown?.(e);
    };

    React.useEffect(() => {
      if (selectedIndex >= 0) {
        setHighlighted(suggestions[selectedIndex]);
      } else if (
        props.placeholder &&
        typeof props.placeholder === "string" &&
        !value
      ) {
        setHighlighted(props.placeholder);
      } else {
        setHighlighted(null);
      }
    }, [selectedIndex, props.placeholder, suggestions, value]);

    return (
      <div className="relative w-full">
        <div className="group relative flex items-center">
          <AnimatePresence>
            {isFocused && (
              <motion.div
                layoutId="enhanced-input-bg"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 z-0 rounded-xl bg-background ring-1 ring-primary/20 shadow-xl"
              >
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-30 blur-sm"
                  animate={{ backgroundPosition: "200% 200%" }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                  }}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(var(--primary-rgb), 0.08), transparent)",
                    backgroundSize: "300% 300%",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* {(showSearchIcon || iconLeft) && (
            <div className="absolute  text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
              {iconLeft || <Search className="h-5 w-5" />}
            </div>
          )} */}

          <motion.div
            className="relative z-10 w-full"
            animate={{ scale: isFocused ? 1.02 : 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Input
              ref={mergedRef}
              className={cn(
                "bg-transparent transition-all duration-200",
                (showSearchIcon || iconLeft) && "pl-10", // 👈 ensures space for the icon
                iconRight && "pr-10",
                className
              )}
              value={value as string}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              {...props}
            />
          </motion.div>

          {iconRight && (
            <div className="absolute right-3 text-muted-foreground">
              {iconRight}
            </div>
          )}
        </div>

        <AnimatePresence>
          {isFocused && highlighted && !value && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 flex items-center gap-2 text-sm text-muted-foreground px-4 py-1.5 rounded-md bg-background/70 ring-1 ring-border/10 backdrop-blur-sm shadow-sm"
            >
              Press{" "}
              <motion.div
                animate={tabPressed ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <motion.div
                  className="absolute inset-0 -z-10 rounded-md bg-primary/10"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={
                    tabPressed
                      ? { scale: [0.9, 1.5, 0.9], opacity: [0, 0.5, 0] }
                      : {}
                  }
                />
                <Kbd
                  size="sm"
                  className={cn(
                    "transition-all duration-300",
                    tabPressed
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-primary/10 text-primary border-primary/30"
                  )}
                >
                  ⇥ Tab
                </Kbd>
              </motion.div>{" "}
              to use suggestion
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-0 right-0 mt-2 z-20 rounded-xl bg-background shadow-xl ring-1 ring-border"
            >
              {suggestions.map((suggestion, i) => (
                <motion.div
                  key={suggestion}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => {
                    setValue(suggestion);
                    onSuggestionSelect?.(suggestion);
                    inputRef.current?.blur();
                  }}
                  className={cn(
                    "cursor-pointer px-4 py-2 text-sm transition-all hover:bg-accent",
                    selectedIndex === i && "bg-accent text-primary font-medium"
                  )}
                >
                  {suggestion}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

function useMergedRef<T>(...refs: React.Ref<T>[]) {
  return React.useCallback(
    (element: T) => {
      refs.forEach((ref) => {
        if (!ref) return;
        typeof ref === "function"
          ? ref(element)
          : ((ref as React.MutableRefObject<T>).current = element);
      });
    },
    [refs]
  );
}

export { EnhancedInput };

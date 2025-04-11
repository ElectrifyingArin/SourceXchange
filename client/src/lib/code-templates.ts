export const CODE_TEMPLATES = {
  javascript: `// Simple function to add two numbers
function add(a, b) {
  return a + b;
}

// Calculate sum of 5 and 3
const result = add(5, 3);
console.log("The sum is:", result);`,

  python: `# Simple function to add two numbers
def add(a, b):
    return a + b

# Calculate sum of 5 and 3
result = add(5, 3)
print("The sum is:", result)`,

  java: `// Simple function to add two numbers
public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        // Calculate sum of 5 and 3
        int result = add(5, 3);
        System.out.println("The sum is: " + result);
    }
}`,

  typescript: `// Simple function to add two numbers
function add(a: number, b: number): number {
  return a + b;
}

// Calculate sum of 5 and 3
const result = add(5, 3);
console.log("The sum is:", result);`,

  csharp: `// Simple function to add two numbers
using System;

class Calculator {
    static int Add(int a, int b) {
        return a + b;
    }
    
    static void Main() {
        // Calculate sum of 5 and 3
        int result = Add(5, 3);
        Console.WriteLine("The sum is: " + result);
    }
}`,

  go: `// Simple function to add two numbers
package main

import "fmt"

func add(a, b int) int {
    return a + b
}

func main() {
    // Calculate sum of 5 and 3
    result := add(5, 3)
    fmt.Println("The sum is:", result)
}`,

  ruby: `# Simple function to add two numbers
def add(a, b)
  return a + b
end

# Calculate sum of 5 and 3
result = add(5, 3)
puts "The sum is: #{result}"`,

  php: `<?php
// Simple function to add two numbers
function add($a, $b) {
    return $a + $b;
}

// Calculate sum of 5 and 3
$result = add(5, 3);
echo "The sum is: " . $result;
?>`,

  swift: `// Simple function to add two numbers
func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}

// Calculate sum of 5 and 3
let result = add(5, 3)
print("The sum is: \\(result)")`,

  rust: `// Simple function to add two numbers
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    // Calculate sum of 5 and 3
    let result = add(5, 3);
    println!("The sum is: {}", result);
}`,

  kotlin: `// Simple function to add two numbers
fun add(a: Int, b: Int): Int {
    return a + b
}

fun main() {
    // Calculate sum of 5 and 3
    val result = add(5, 3)
    println("The sum is: $result")
}`,

  dart: `// Simple function to add two numbers
int add(int a, int b) {
  return a + b;
}

void main() {
  // Calculate sum of 5 and 3
  var result = add(5, 3);
  print("The sum is: $result");
}`,
} as const;

export type SupportedLanguage = keyof typeof CODE_TEMPLATES; 
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CodeEditor } from "@/components/ui/code-editor";
import { getLanguageById } from "@/lib/supported-languages";
import type { SupportedLanguage } from "@/lib/supported-languages";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CodeExample = {
  title: string;
  code: string;
};

type CodeExamplesType = {
  [key: string]: CodeExample[];
};

// Define the example code snippets for each language
const codeExamples: CodeExamplesType = {
  javascript: [
  {
    title: "Fibonacci Sequence",
    code: `// Function to calculate fibonacci sequence
function fibonacci(n) {
  if (n <= 1) return n;
  
  let fib = [0, 1];
  
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i-1] + fib[i-2];
  }
  
  return fib[n];
}

// Calculate first 10 fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}

console.log("Fibonacci sequence:", results);`
  },
  {
    title: "Binary Search Algorithm",
    code: `// Binary search implementation
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// Example usage
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15];
const target = 7;
const result = binarySearch(sortedArray, target);
console.log(\`Found target \${target} at index: \${result}\`);`
  },
  {
    title: "Simple Todo App",
    code: `// Todo list implementation
class TodoList {
  constructor() {
    this.todos = [];
  }
  
  addTodo(text) {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false
    });
  }
  
  toggleTodo(id) {
    this.todos = this.todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }
  
  removeTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }
  
  getTodos() {
    return this.todos;
  }
}

// Example usage
const todoList = new TodoList();
todoList.addTodo("Learn JavaScript");
todoList.addTodo("Build an app");
todoList.toggleTodo(todoList.todos[0].id);
console.log("Todo list:", todoList.getTodos());`
  },
  {
    title: "API Data Fetching",
    code: `// Fetch data from a REST API
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetching user data failed:", error);
    return null;
  }
}

// Process the data
async function displayUserInfo(userId) {
  const userData = await fetchUserData(userId);
  
  if (userData) {
    console.log("User Information:");
    console.log(\`Name: \${userData.name}\`);
    console.log(\`Email: \${userData.email}\`);
    console.log(\`Role: \${userData.role}\`);
  } else {
    console.log("Failed to load user data");
  }
}

// Example call
displayUserInfo(123);`
    }
  ],
  typescript: [
    {
      title: "Generic Data Structure",
      code: `// Generic Stack implementation
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

// Example usage with different types
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop()); // 2

const stringStack = new Stack<string>();
stringStack.push("Hello");
stringStack.push("World");
console.log(stringStack.peek()); // "World"`
    },
    {
      title: "Interface and Type Guards",
      code: `// Define interfaces
interface Bird {
  type: 'bird';
  flies: boolean;
  laysEggs: boolean;
}

interface Fish {
  type: 'fish';
  swims: boolean;
  laysEggs: boolean;
}

type Animal = Bird | Fish;

// Type guard functions
function isBird(animal: Animal): animal is Bird {
  return animal.type === 'bird';
}

function isFish(animal: Animal): animal is Fish {
  return animal.type === 'fish';
}

// Function using type guards
function moveAnimal(animal: Animal) {
  if (isBird(animal)) {
    console.log(animal.flies ? "Flying..." : "Walking...");
  } else if (isFish(animal)) {
    console.log(animal.swims ? "Swimming..." : "Floating...");
  }
}

// Example usage
const parrot: Bird = { type: 'bird', flies: true, laysEggs: true };
const salmon: Fish = { type: 'fish', swims: true, laysEggs: true };

moveAnimal(parrot);  // "Flying..."
moveAnimal(salmon);  // "Swimming..."`
    }
  ],
  python: [
    {
      title: "Fibonacci Sequence",
      code: `# Function to calculate fibonacci sequence
def fibonacci(n):
    if n <= 1:
        return n
    
    fib = [0, 1]
    
    for i in range(2, n + 1):
        fib.append(fib[i-1] + fib[i-2])
    
    return fib[n]

# Calculate first 10 fibonacci numbers
results = []
for i in range(10):
    results.append(fibonacci(i))

print("Fibonacci sequence:", results)`
    },
    {
      title: "Binary Search Algorithm",
      code: `# Binary search implementation
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Example usage
sorted_array = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
result = binary_search(sorted_array, target)
print(f"Found target {target} at index: {result}")`
    },
    {
      title: "Simple Todo App",
      code: `# Todo list implementation
class TodoList:
    def __init__(self):
        self.todos = []
    
    def add_todo(self, text):
        self.todos.append({
            'id': int(time.time()),
            'text': text,
            'completed': False
        })
    
    def toggle_todo(self, todo_id):
        self.todos = [
            {**todo, 'completed': not todo['completed']} 
            if todo['id'] == todo_id else todo 
            for todo in self.todos
        ]
    
    def remove_todo(self, todo_id):
        self.todos = [todo for todo in self.todos if todo['id'] != todo_id]
    
    def get_todos(self):
        return self.todos

# Example usage
todo_list = TodoList()
todo_list.add_todo("Learn Python")
todo_list.add_todo("Build an app")
todo_list.toggle_todo(todo_list.todos[0]['id'])
print("Todo list:", todo_list.get_todos())`
    },
    {
      title: "API Data Fetching",
      code: `# Fetch data from a REST API
import requests

def fetch_user_data(user_id):
    try:
        response = requests.get(f"https://api.example.com/users/{user_id}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as error:
        print(f"Fetching user data failed: {error}")
        return None

# Process the data
def display_user_info(user_id):
    user_data = fetch_user_data(user_id)
    
    if user_data:
        print("User Information:")
        print(f"Name: {user_data['name']}")
        print(f"Email: {user_data['email']}")
        print(f"Role: {user_data['role']}")
    else:
        print("Failed to load user data")

# Example call
display_user_info(123)`
    }
  ],
  java: [
    {
      title: "Fibonacci Sequence",
      code: `// Function to calculate fibonacci sequence
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        
        int[] fib = new int[n + 1];
        fib[0] = 0;
        fib[1] = 1;
        
        for (int i = 2; i <= n; i++) {
            fib[i] = fib[i-1] + fib[i-2];
        }
        
        return fib[n];
    }

    public static void main(String[] args) {
        // Calculate first 10 fibonacci numbers
        int[] results = new int[10];
        for (int i = 0; i < 10; i++) {
            results[i] = fibonacci(i);
        }
        
        System.out.println("Fibonacci sequence: " + Arrays.toString(results));
    }
}`
    },
    {
      title: "Binary Search Algorithm",
      code: `// Binary search implementation
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1;
    }

    public static void main(String[] args) {
        int[] sortedArray = {1, 3, 5, 7, 9, 11, 13, 15};
        int target = 7;
        int result = binarySearch(sortedArray, target);
        System.out.println("Found target " + target + " at index: " + result);
    }
}`
    },
    {
      title: "Simple Todo App",
      code: `// Todo list implementation
import java.util.ArrayList;
import java.util.List;

class Todo {
    private int id;
    private String text;
    private boolean completed;
    
    public Todo(int id, String text) {
        this.id = id;
        this.text = text;
        this.completed = false;
    }
    
    // Getters and setters
    public int getId() { return id; }
    public String getText() { return text; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
}

class TodoList {
    private List<Todo> todos;
    
    public TodoList() {
        this.todos = new ArrayList<>();
    }
    
    public void addTodo(String text) {
        todos.add(new Todo((int) System.currentTimeMillis(), text));
    }
    
    public void toggleTodo(int id) {
        for (Todo todo : todos) {
            if (todo.getId() == id) {
                todo.setCompleted(!todo.isCompleted());
                break;
            }
        }
    }
    
    public void removeTodo(int id) {
        todos.removeIf(todo -> todo.getId() == id);
    }
    
    public List<Todo> getTodos() {
        return todos;
    }
}

public class Main {
    public static void main(String[] args) {
        TodoList todoList = new TodoList();
        todoList.addTodo("Learn Java");
        todoList.addTodo("Build an app");
        todoList.toggleTodo(todoList.getTodos().get(0).getId());
        System.out.println("Todo list: " + todoList.getTodos());
    }
}`
    },
    {
      title: "API Data Fetching",
      code: `// Fetch data from a REST API
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import com.google.gson.Gson;

class User {
    private String name;
    private String email;
    private String role;
    
    // Getters and setters
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}

public class ApiClient {
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final Gson gson = new Gson();
    
    public static User fetchUserData(int userId) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.example.com/users/" + userId))
                .build();
            
            HttpResponse<String> response = client.send(request, 
                HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                return gson.fromJson(response.body(), User.class);
            }
            return null;
        } catch (Exception e) {
            System.err.println("Fetching user data failed: " + e.getMessage());
            return null;
        }
    }
    
    public static void displayUserInfo(int userId) {
        User userData = fetchUserData(userId);
        
        if (userData != null) {
            System.out.println("User Information:");
            System.out.println("Name: " + userData.getName());
            System.out.println("Email: " + userData.getEmail());
            System.out.println("Role: " + userData.getRole());
        } else {
            System.out.println("Failed to load user data");
        }
    }
    
    public static void main(String[] args) {
        displayUserInfo(123);
    }
}`
    }
  ],
  csharp: [
    {
      title: "LINQ Query Examples",
      code: `using System;
using System.Linq;
using System.Collections.Generic;

class Program {
    static void Main() {
        // Sample data
        var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        var words = new List<string> { "apple", "banana", "cherry", "date" };

        // LINQ query examples
        var evenNumbers = numbers.Where(n => n % 2 == 0);
        Console.WriteLine("Even numbers: " + string.Join(", ", evenNumbers));

        var squaredNumbers = numbers.Select(n => n * n);
        Console.WriteLine("Squared: " + string.Join(", ", squaredNumbers));

        var longWords = words.Where(w => w.Length > 5)
                           .OrderBy(w => w);
        Console.WriteLine("Long words: " + string.Join(", ", longWords));

        var wordLengths = words.Select(w => new { Word = w, Length = w.Length });
        foreach (var item in wordLengths) {
            Console.WriteLine($"{item.Word}: {item.Length} chars");
        }
    }
}`
    },
    {
      title: "Async/Await Pattern",
      code: `using System;
using System.Threading.Tasks;
using System.Net.Http;

class Program {
    static async Task Main() {
        await ProcessDataAsync();
    }

    static async Task ProcessDataAsync() {
        Console.WriteLine("Starting process...");
        
        try {
            var result1 = await FetchDataAsync("https://api.example.com/data1");
            var result2 = await FetchDataAsync("https://api.example.com/data2");
            
            Console.WriteLine($"Results: {result1}, {result2}");
        }
        catch (Exception ex) {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    static async Task<string> FetchDataAsync(string url) {
        using (var client = new HttpClient()) {
            Console.WriteLine($"Fetching data from {url}");
            var response = await client.GetStringAsync(url);
            return response;
        }
    }
}`
    }
  ],
  go: [
    {
      title: "Goroutines and Channels",
      code: `package main

import (
    "fmt"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("worker %d started job %d\n", id, j)
        time.Sleep(time.Second) // Simulate work
        fmt.Printf("worker %d finished job %d\n", id, j)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 5)
    results := make(chan int, 5)

    // Start 3 workers
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // Send 5 jobs
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    // Collect results
    for a := 1; a <= 5; a++ {
        <-results
    }
}`
    },
    {
      title: "Custom HTTP Server",
      code: `package main

import (
    "encoding/json"
    "log"
    "net/http"
)

type Response struct {
    Message string \`json:"message"\`
    Status  int    \`json:"status"\`
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
    response := Response{
        Message: "Welcome to Go API",
        Status:  200,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    response := Response{
        Message: "Service is healthy",
        Status:  200,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func main() {
    http.HandleFunc("/", handleRoot)
    http.HandleFunc("/health", handleHealth)

    log.Println("Server starting on port 8080...")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatal(err)
    }
}`
    }
  ],
  ruby: [
    {
      title: "Metaprogramming Example",
      code: `# Dynamic method creation
class Person
  def initialize(name)
    @name = name
  end

  # Define methods dynamically
  [:laugh, :cry, :smile, :frown].each do |action|
    define_method(action) do
      puts "#{@name} is #{action}ing"
    end
  end

  # Method missing example
  def method_missing(method_name, *args)
    if method_name.to_s.start_with?('can_')
      ability = method_name.to_s.sub('can_', '')
      puts "#{@name} can #{ability}!"
    else
      super
    end
  end
end

# Usage example
person = Person.new("Ruby")
person.laugh   # => "Ruby is laughing"
person.cry     # => "Ruby is crying"
person.can_fly # => "Ruby can fly!"
person.can_code # => "Ruby can code!"`
    },
    {
      title: "Ruby Blocks and Yields",
      code: `# Custom enumerable with blocks
class NumberSequence
  include Enumerable
  
  def initialize(start, finish)
    @start = start
    @finish = finish
  end

  def each
    return enum_for(:each) unless block_given?
    
    current = @start
    while current <= @finish
      yield current
      current += 1
    end
  end
end

# Usage examples
sequence = NumberSequence.new(1, 5)

# Using blocks
sequence.each { |n| puts "Number: #{n}" }

# Using map
squares = sequence.map { |n| n * n }
puts "Squares: #{squares}"

# Using select
evens = sequence.select { |n| n.even? }
puts "Even numbers: #{evens}"

# Custom block method
def timer
  start_time = Time.now
  yield if block_given?
  puts "Time taken: #{Time.now - start_time} seconds"
end

timer do
  # Some time-consuming operation
  sleep(1)
  puts "Operation completed"
end`
    }
  ],
  php: [
    {
      title: "Laravel-style Controller",
      code: `<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index()
    {
        $users = User::paginate(10);
        return view('users.index', compact('users'));
    }

    /**
     * Store a new user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()
            ->route('users.show', $user)
            ->with('success', 'User created successfully');
    }

    /**
     * Update user information
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }
}`
    },
    {
      title: "Design Pattern - Repository",
      code: `<?php

namespace App\Repositories;

interface UserRepositoryInterface
{
    public function all();
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
}

class UserRepository implements UserRepositoryInterface
{
    protected $model;

    public function __construct(User $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->all();
    }

    public function find($id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $record = $this->find($id);
        $record->update($data);
        return $record;
    }

    public function delete($id)
    {
        return $this->model->destroy($id);
    }
}

// Service Provider Registration
class RepositoryServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );
    }
}

// Controller Usage
class UserController extends Controller
{
    protected $users;

    public function __construct(UserRepositoryInterface $users)
    {
        $this->users = $users;
    }

    public function index()
    {
        return $this->users->all();
    }
}`
    }
  ],
  swift: [
    {
      title: "Protocol-Oriented Programming",
      code: `// Define protocols
protocol Animal {
    var name: String { get }
    var sound: String { get }
    func makeSound()
}

protocol Flyable {
    var wingSpan: Double { get }
    func fly()
}

// Protocol extension with default implementation
extension Animal {
    func makeSound() {
        print("\(name) says \(sound)!")
    }
}

extension Flyable {
    func fly() {
        print("Flying with wingspan of \(wingSpan) meters")
    }
}

// Struct implementing protocols
struct Bird: Animal, Flyable {
    let name: String
    let sound: String
    let wingSpan: Double
    
    // Custom implementation
    func fly() {
        print("\(name) soars through the sky!")
    }
}

// Class implementing protocol
class Cat: Animal {
    let name: String
    let sound: String
    
    init(name: String) {
        self.name = name
        self.sound = "meow"
    }
}

// Usage
let eagle = Bird(name: "Eagle", sound: "screech", wingSpan: 2.3)
eagle.makeSound() // Eagle says screech!
eagle.fly() // Eagle soars through the sky!

let cat = Cat(name: "Whiskers")
cat.makeSound() // Whiskers says meow!`
    },
    {
      title: "Modern Swift Concurrency",
      code: `import Foundation

// Actor to manage shared state
actor ImageDownloader {
    private var cache: [URL: Data] = [:]
    
    func downloadImage(from url: URL) async throws -> Data {
        if let cachedData = cache[url] {
            return cachedData
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        cache[url] = data
        return data
    }
}

// Async sequence for processing
struct NumberGenerator: AsyncSequence, AsyncIteratorProtocol {
    typealias Element = Int
    var current = 0
    let end: Int
    
    mutating func next() async -> Int? {
        guard current < end else { return nil }
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        defer { current += 1 }
        return current
    }
    
    func makeAsyncIterator() -> NumberGenerator {
        self
    }
}

// Main async function
@main
struct ConcurrencyExample {
    static func main() async throws {
        let downloader = ImageDownloader()
        
        // Parallel image downloads
        async let image1 = try downloader.downloadImage(
            from: URL(string: "https://example.com/image1.jpg")!
        )
        async let image2 = try downloader.downloadImage(
            from: URL(string: "https://example.com/image2.jpg")!
        )
        
        let images = try await [image1, image2]
        print("Downloaded \(images.count) images")
        
        // Process numbers concurrently
        let numbers = NumberGenerator(end: 5)
        for try await number in numbers {
            print("Processing number: \(number)")
        }
    }
}`
    }
  ],
  rust: [
    {
      title: "Safe Concurrency with Ownership",
      code: `use std::sync::{Arc, Mutex};
use std::thread;

// Define a shared state structure
struct SharedState {
    counter: i32,
}

fn main() {
    // Create thread-safe shared state
    let state = Arc::new(Mutex::new(SharedState { counter: 0 }));
    let mut handles = vec![];

    // Spawn multiple threads
    for i in 0..5 {
        let state_clone = Arc::clone(&state);
        
        let handle = thread::spawn(move || {
            // Lock the mutex to access shared state
            let mut state = state_clone.lock().unwrap();
            state.counter += 1;
            println!("Thread {} incremented counter to {}", i, state.counter);
        });
        
        handles.push(handle);
    }

    // Wait for all threads to complete
    for handle in handles {
        handle.join().unwrap();
    }

    // Print final state
    let final_state = state.lock().unwrap();
    println!("Final counter value: {}", final_state.counter);
}`
    },
    {
      title: "Error Handling and Results",
      code: `use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

// Custom error type
#[derive(Debug)]
enum AppError {
    IoError(io::Error),
    ParseError(String),
}

impl From<io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError::IoError(error)
    }
}

// Function that returns a Result
fn read_config_file(path: &Path) -> Result<String, AppError> {
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    
    if contents.is_empty() {
        return Err(AppError::ParseError("Config file is empty".to_string()));
    }
    
    Ok(contents)
}

fn main() {
    let config_path = Path::new("config.txt");
    
    match read_config_file(config_path) {
        Ok(config) => {
            println!("Configuration loaded successfully:");
            println!("{}", config);
        }
        Err(error) => match error {
            AppError::IoError(e) => println!("IO error: {}", e),
            AppError::ParseError(msg) => println!("Parse error: {}", msg),
        },
    }
    
    // Using the ? operator in main
    if let Err(e) = run() {
        eprintln!("Application error: {:?}", e);
    }
}

fn run() -> Result<(), AppError> {
    let config = read_config_file(Path::new("config.txt"))?;
    println!("Config: {}", config);
    Ok(())
}`
    }
  ],
  kotlin: [
    {
      title: "Coroutines Example",
      code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

suspend fun main() = coroutineScope {
    // Create a flow of numbers
    val numbersFlow = flow {
        for (i in 1..5) {
            delay(100)
            emit(i)
        }
    }

    // Launch parallel coroutines
    val job1 = launch {
        println("Job 1 started")
        delay(1000)
        println("Job 1 completed")
    }

    val job2 = async {
        println("Job 2 started")
        delay(500)
        "Job 2 result"
    }

    // Collect flow values
    launch {
        numbersFlow
            .map { it * it }
            .collect { println("Received: $it") }
    }

    // Wait for async job and print result
    println(job2.await())
    
    // Cancel the first job
    job1.cancel()
}

// Structured concurrency example
suspend fun fetchUserData(): String = coroutineScope {
    val userDeferred = async { fetchUser() }
    val profileDeferred = async { fetchProfile() }
    
    "User: \${userDeferred.await()}, Profile: \${profileDeferred.await()}"
}

suspend fun fetchUser(): String {
    delay(1000)
    return "John Doe"
}

suspend fun fetchProfile(): String {
    delay(500)
    return "Developer"`
    },
    {
      title: "DSL Builder Pattern",
      code: `// HTML DSL Builder
class HTML {
    private val content = StringBuilder()
    
    fun head(init: Head.() -> Unit) {
        content.append("<head>")
        Head().apply(init)
        content.append("</head>")
    }
    
    fun body(init: Body.() -> Unit) {
        content.append("<body>")
        Body().apply(init)
        content.append("</body>")
    }
    
    override fun toString() = "<html>$content</html>"
}

class Head {
    private val content = StringBuilder()
    
    fun title(text: String) {
        content.append("<title>\${text}</title>")
    }
}

class Body {
    private val content = StringBuilder()
    
    fun div(init: Div.() -> Unit) {
        content.append("<div>")
        Div().apply(init)
        content.append("</div>")
    }
    
    fun p(text: String) {
        content.append("<p>\${text}</p>")
    }
}

class Div {
    private val content = StringBuilder()
    
    fun p(text: String) {
        content.append("<p>\${text}</p>")
    }
}

// Usage
fun html(init: HTML.() -> Unit): HTML {
    return HTML().apply(init)
}

fun main() {
    val page = html {
        head {
            title("Welcome")
        }
        body {
            div {
                p("Hello, World!")
            }
            p("This is a Kotlin DSL example")
        }
    }
    
    println(page.toString())
}`
    }
  ]
};

export function CodeExamples() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const { toast } = useToast();

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? codeExamples[currentLanguage].length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex === codeExamples[currentLanguage].length - 1 ? 0 : prevIndex + 1
    );
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Code example has been copied to your clipboard",
    });
  };

  const currentExample = codeExamples[currentLanguage][currentIndex];
  const language = getLanguageById(currentLanguage);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="relative py-4 overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
        Code Examples
      </h2>
      
      <div className="flex justify-center mb-6">
        <Select value={currentLanguage} onValueChange={(value) => {
          setCurrentLanguage(value);
          setCurrentIndex(0);
        }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="csharp">C#</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="ruby">Ruby</SelectItem>
            <SelectItem value="php">PHP</SelectItem>
            <SelectItem value="swift">Swift</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
            <SelectItem value="kotlin">Kotlin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative mx-auto max-w-4xl">
        <div className="min-h-[400px] flex items-center">
          <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
              className="w-full absolute"
          >
            <Card className="shadow-lg border-2 border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-medium text-lg">{currentExample.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyCode(currentExample.code)}
                  className="rounded-full transition-transform hover:scale-110"
                  title="Copy code"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <CodeEditor
                  value={currentExample.code}
                  language={language}
                  readOnly
                  height="300px"
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center mt-4 space-x-4">
        <Button
          onClick={goToPrevious}
          variant="outline"
          size="icon"
          className="rounded-full transition-transform hover:scale-110 bg-white dark:bg-slate-800"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex space-x-2 items-center">
          {codeExamples[currentLanguage].map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                ? "bg-primary scale-125" 
                : "bg-slate-300 dark:bg-slate-600"
              }`}
              aria-label={`Go to example ${index + 1}`}
            />
          ))}
        </div>
        <Button
          onClick={goToNext}
          variant="outline"
          size="icon"
          className="rounded-full transition-transform hover:scale-110 bg-white dark:bg-slate-800"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
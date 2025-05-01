// This is a mock database client for demonstration purposes
// In a real application, you would use Prisma or another database client

export const db = {
  user: {
    findUnique: async ({ where }: { where: { email: string } }) => {
      // Mock user data
      const users = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          password: "$2a$10$Hl0YE9qT6.HaI8xZZKZ7XeOgI.0ueUQe.Lz9JBvXQ5JJQ.ZZ5ZZZ", // "password"
        },
        {
          id: "2",
          name: "Admin User",
          email: "admin@jingally.com",
          password: "$2a$10$Hl0YE9qT6.HaI8xZZKZ7XeOgI.0ueUQe.Lz9JBvXQ5JJQ.ZZ5ZZZ", // "password"
        },
      ]

      return users.find((user) => user.email === where.email) || null
    },
    create: async ({ data }: { data: any }) => {
      // In a real application, this would create a user in the database
      return {
        id: "new-user-id",
        name: data.name,
        email: data.email,
      }
    },
  },
}

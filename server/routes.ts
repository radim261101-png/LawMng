import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateValuRecordSchema, EDITABLE_FIELDS } from "@shared/schema";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    role: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "valu-legal-secret-key-12345",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  });

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  app.get("/api/records", requireAuth, async (req, res) => {
    try {
      const records = await storage.getAllRecords();
      return res.json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      return res.status(500).json({ message: "Failed to fetch records" });
    }
  });

  app.get("/api/records/:id", requireAuth, async (req, res) => {
    try {
      const record = await storage.getRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      return res.json(record);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch record" });
    }
  });

  app.patch("/api/records/:id", requireAuth, async (req, res) => {
    try {
      const username = req.session.username!;
      const role = req.session.role!;
      
      const record = await storage.getRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      const validatedData = updateValuRecordSchema.parse(req.body);
      
      if (role !== "admin") {
        const filteredData: Partial<typeof validatedData> = {};
        
        Object.keys(validatedData).forEach((key) => {
          const fieldKey = key as keyof typeof validatedData;
          const newValue = validatedData[fieldKey];
          const oldValue = record[fieldKey];
          
          if (!EDITABLE_FIELDS.includes(fieldKey as any)) {
            return;
          }
          
          if (newValue && typeof newValue === 'string' && newValue.trim()) {
            if (oldValue && typeof oldValue === 'string' && oldValue.trim()) {
              filteredData[fieldKey] = `${oldValue}\n${newValue}` as any;
            } else {
              filteredData[fieldKey] = newValue;
            }
          }
        });
        
        const updatedRecord = await storage.updateRecord(req.params.id, filteredData, username);
        return res.json(updatedRecord);
      }
      
      const updatedRecord = await storage.updateRecord(req.params.id, validatedData, username);
      return res.json(updatedRecord);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update record" });
    }
  });

  app.get("/api/records/:id/history", requireAuth, async (req, res) => {
    try {
      const updates = await storage.getRecordUpdates(req.params.id);
      return res.json(updates);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch record history" });
    }
  });

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.session.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  app.get("/api/updates/all", requireAdmin, async (req, res) => {
    try {
      const updates = await storage.getAllRecordUpdates();
      return res.json(updates);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch all updates" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

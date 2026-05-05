import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { format } from "date-fns";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database for Preview
  // In a real scenario, this would be the Google Sheet
  let cases: any[] = [
    {
      id: "DC-2024001",
      numeroexpediente: "01/2024",
      nombre: "Juan",
      apellido: "Pérez",
      dni: "12345678",
      telefono: "3834001122",
      email: "juan@perez.com",
      barrio: "Centro",
      calle: "Sarmiento",
      numeracion: "123",
      entrecalle1: "Rivadavia",
      entrecalle2: "San Martin",
      localidad: "Catamarca",
      departamento: "Capital",
      tipo: "Servicio",
      caracteristicas: "Internet",
      empresasDenunciadas: [{ nombre: "Telecom", domicilio: "Bs As 100" }],
      reclamo: "Problemas constantes con la velocidad de internet.",
      peticiones: "Reembolso del cargo por servicio no prestado.",
      fechaAudiencia: "2024-06-15T09:00:00",
      estado: "Pendiente",
      usuario: "admin",
      historialEstados: [
        { estado: "Pendiente", usuario: "admin", fecha: new Date().toISOString() }
      ]
    }
  ];

  const users = [
    { usuario: "ivan", password: "123", nombre: "Ivan" },
    { usuario: "admin", password: "123", nombre: "Administrador" }
  ];

  // --- API ROUTES ---
  const GAS_URL = process.env.GAS_URL;

  const fetchFromGas = async (action: string, data: any = {}) => {
    if (!GAS_URL) return null;
    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from GAS (${action}):`, error);
      return null;
    }
  };

  // Auth
  app.post("/api/login", async (req, res) => {
    const { usuario, password } = req.body;
    console.log(`Login attempt: ${usuario}`);

    // Try GAS first if configured
    if (GAS_URL) {
      const result = await fetchFromGas("login", { usuario, password });
      if (result) {
        if (result.success) {
          return res.json(result);
        } else {
          return res.status(401).json(result);
        }
      }
    }

    // Fallback to Mock Database for testing
    const user = users.find(u => 
      u.usuario.toString().toLowerCase() === usuario.toString().toLowerCase() && 
      u.password.toString() === password.toString()
    );
    if (user) {
      res.json({ success: true, user: { usuario: user.usuario, nombre: user.nombre } });
    } else {
      res.status(401).json({ success: false, message: "DNI o Contraseña incorrecta (Mock)" });
    }
  });

  // List Cases
  app.get("/api/cases", async (req, res) => {
    if (GAS_URL) {
      try {
        const response = await fetch(`${GAS_URL}?action=getCases`);
        const data = await response.json();
        return res.json(data);
      } catch (err) {
        console.error("Error fetching cases from GAS:", err);
      }
    }
    res.json(cases);
  });

  // Get Stats
  app.get("/api/stats", async (req, res) => {
    if (GAS_URL) {
      try {
        const response = await fetch(`${GAS_URL}?action=getStats`);
        const data = await response.json();
        return res.json(data);
      } catch (err) {
        console.error("Error fetching stats from GAS:", err);
      }
    }
    const stats = {
      total: cases.length,
      byTipo: cases.reduce((acc, c) => {
        acc[c.tipo] = (acc[c.tipo] || 0) + 1;
        return acc;
      }, {} as any),
      byCaracteristicas: cases.reduce((acc, c) => {
        acc[c.caracteristicas] = (acc[c.caracteristicas] || 0) + 1;
        return acc;
      }, {} as any),
      byDepartamento: cases.reduce((acc, c) => {
        acc[c.departamento] = (acc[c.departamento] || 0) + 1;
        return acc;
      }, {} as any)
    };
    res.json(stats);
  });

  // Create Case
  app.post("/api/cases", async (req, res) => {
    const body = req.body;
    
    if (GAS_URL) {
      const result = await fetchFromGas("createCase", { payload: body, activeUser: body.activeUser });
      if (result && result.success) return res.json(result);
      if (result && result.error) return res.status(400).json({ message: result.error });
    }

    // Auto-generate IDs
    const year = new Date().getFullYear();
    const count = cases.filter(c => c.id.startsWith(`DC-${year}`)).length + 1;
    const id = `DC-${year}${String(count).padStart(3, '0')}`;
    const numeroexpediente = `${String(count).padStart(2, '0')}/${year}`;

    // Validate Hearing Slot
    if (body.fechaAudiencia) {
      const slotCount = cases.filter(c => c.fechaAudiencia === body.fechaAudiencia).length;
      if (slotCount >= 2) {
        return res.status(400).json({ message: "Cupo de audiencia completo para este horario (Máx 2)" });
      }
    }

    const newCase = {
      ...body,
      id,
      numeroexpediente,
      estado: body.estado || "Pendiente",
      historialEstados: [
        { estado: body.estado || "Pendiente", usuario: body.activeUser, fecha: new Date().toISOString() }
      ]
    };

    cases.push(newCase);
    res.json(newCase);
  });

  // Update Status
  app.patch("/api/cases/:id/status", async (req, res) => {
    const { id } = req.params;
    const { estado, usuario } = req.body;

    if (GAS_URL) {
      const result = await fetchFromGas("updateStatus", { id, estado, usuario });
      if (result && result.success) return res.json(result);
    }

    const c = cases.find(item => item.id === id);
    if (c) {
      c.estado = estado;
      c.historialEstados.push({
        estado,
        usuario,
        fecha: new Date().toISOString()
      });
      res.json(c);
    } else {
      res.status(404).send("Case not found");
    }
  });

  // Update Hearing
  app.patch("/api/cases/:id/hearing", async (req, res) => {
    const { id } = req.params;
    const { fechaAudiencia } = req.body;

    if (GAS_URL) {
      const result = await fetchFromGas("updateHearing", { id, fechaAudiencia });
      if (result && result.success) return res.json(result);
      if (result && result.error) return res.status(400).json({ message: result.error });
    }
    
    // Validate slot limit
    const slotCount = cases.filter(c => c.fechaAudiencia === fechaAudiencia && c.id !== id).length;
    if (slotCount >= 2) {
      return res.status(400).json({ message: "Cupo de audiencia completo (Máx 2)" });
    }

    const c = cases.find(item => item.id === id);
    if (c) {
      c.fechaAudiencia = fechaAudiencia;
      res.json(c);
    } else {
      res.status(404).send("Case not found");
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

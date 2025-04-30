"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Mensagem = {
  id: number;
  telefone: string;
  seed: boolean;
  total: number | null;
  porcentagem: number | null;
  status: boolean;
};

export default function DashboardPage() {
  const [dados, setDados] = useState<Mensagem[]>([]);

  useEffect(() => {
    const fetchDados = async () => {
      const res = await fetch("/api/mensagens");
      const json = await res.json();
      setDados(json);
    };

    fetchDados(); // primeira carga imediata

    const interval = setInterval(fetchDados, 60000); // a cada 1 minuto

    return () => clearInterval(interval); // limpa o intervalo ao desmontar
  }, []);

  const enviados = dados.filter((d) => d.status).length;
  const pendentes = dados.length - enviados;
  const comSeed = dados.filter((d) => d.seed).length;

  async function enviarMensagens() {
    try {
      const res = await fetch(
        "https://disparador-em-massa-n8n.m6gjmc.easypanel.host/webhook/2db175d6-1b19-4ae1-a4c2-2d50411a7197",
        {
          method: "POST",
        }
      );

      if (res.ok) {
        toast.success("Mensagens enviadas com sucesso!");
      } else {
        toast.error("Falha ao disparar mensagens.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar com o webhook.");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Button onClick={enviarMensagens} className="mb-4">
        Disparar Mensagens
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>{dados.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enviadas</CardTitle>
          </CardHeader>
          <CardContent>{enviados}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seed Ativado</CardTitle>
          </CardHeader>
          <CardContent>{comSeed}</CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { status: "Enviadas", valor: enviados },
                { status: "Pendentes", valor: pendentes },
              ]}
            >
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Seed</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Porcentagem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.telefone}</TableCell>
                  <TableCell>{m.seed ? "Sim" : "Não"}</TableCell>
                  <TableCell>{m.total ?? "—"}</TableCell>
                  <TableCell>{(m.porcentagem ?? 0).toFixed(2)}%</TableCell>
                  <TableCell>
                    <Badge variant={m.status ? "default" : "outline"}>
                      {m.status ? "Enviado" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

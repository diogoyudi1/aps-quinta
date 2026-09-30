import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
        "As variáveis de ambiente SUPABASE_URL e SUPABASE_SECRET_KEY não foram configuradas. " +
        "Verifique o arquivo .env (use o .env.example como modelo)."
    );
}

const compatibilidadeComNodeAntigo = (globalThis as { WebSocket?: unknown }).WebSocket
    ? {}
    : {
        realtime: {
            transport: class TransportNaoUtilizado {
                constructor() {
                    throw new Error("Esta API não utiliza os recursos de Realtime do Supabase.");
                }
            } as never,
        },
    };

const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey,
    compatibilidadeComNodeAntigo,
);

export default supabase;

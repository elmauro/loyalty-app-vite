import { useState } from 'react';
import { Tenant } from '@/types/program';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Key, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { generateApiKeyForTenant } from '@/services/tenantService';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
}

export function TenantApiKeyDialog({ open, onOpenChange, tenant }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!tenant) return;
    setIsGenerating(true);
    setGeneratedKey(null);
    try {
      const { apiKey } = await generateApiKeyForTenant(tenant.tenantId);
      setGeneratedKey(apiKey);
      toast.success('API key generada. Cópiala ahora, no se mostrará de nuevo.');
    } catch {
      // Error ya manejado por interceptor
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      toast.success('API key copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const handleClose = () => {
    setGeneratedKey(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="tenant-api-key-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {tenant ? `API Key - ${tenant.name}` : 'API Key'}
          </DialogTitle>
          <DialogDescription>
            {tenant
              ? 'Genera o regenera la API key para integraciones POS. Al regenerar, la clave anterior dejará de funcionar.'
              : ''}
          </DialogDescription>
        </DialogHeader>

        {tenant && (
          <div className="space-y-4 py-2">
            {generatedKey ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
                  Guarda esta clave. No se mostrará de nuevo.
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={generatedKey}
                    className="font-mono text-sm"
                    data-testid="api-key-display"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    title="Copiar"
                    data-testid="api-key-copy-btn"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                data-testid="api-key-generate-btn"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                Generar API key
              </Button>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {generatedKey ? 'Cerrar' : 'Cancelar'}
          </Button>
          {generatedKey && (
            <Button onClick={handleGenerate} disabled={isGenerating} variant="secondary">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Regenerar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

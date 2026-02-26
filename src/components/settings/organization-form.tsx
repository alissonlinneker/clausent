'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc/react'

/**
 * Schema de validação para o formulário de organização.
 * Nome obrigatório com mínimo de 2 caracteres.
 */
const organizationFormSchema = z.object({
  name: z.string().min(2, 'O nome deve ter ao menos 2 caracteres').max(255),
})

/** Tipo inferido do schema para uso no formulário */
type OrganizationFormValues = z.infer<typeof organizationFormSchema>

/**
 * Formulário de edição das configurações da organização.
 *
 * Funcionalidades:
 * - Carrega os dados atuais da organização via tRPC
 * - Permite editar o nome com validação em tempo real
 * - Feedback visual de loading durante o save
 * - Toast de sucesso/erro após a operação
 *
 * Requisito: o usuário deve ter role 'admin' para salvar.
 * A validação de permissão é feita no backend (router).
 */
export function OrganizationForm() {
  /** Busca os dados atuais da organização */
  const { data: org, isLoading: isLoadingOrg } = trpc.organization.get.useQuery()

  /** Utilitário para invalidar queries após mutação */
  const utils = trpc.useUtils()

  /** Mutation para atualizar a organização */
  const updateOrg = trpc.organization.update.useMutation({
    onSuccess: () => {
      toast.success('Organization updated successfully')
      /** Invalida a query para refletir os novos dados */
      utils.organization.get.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update organization')
    },
  })

  /** Inicializa o formulário com validação Zod */
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
    },
  })

  /**
   * Preenche o formulário quando os dados da organização carregam.
   * Usa reset() para sincronizar com os dados do servidor.
   */
  useEffect(() => {
    if (org) {
      form.reset({ name: org.name })
    }
  }, [org, form])

  /** Handler de submit — envia a mutação ao backend */
  const onSubmit = (values: OrganizationFormValues) => {
    updateOrg.mutate(values)
  }

  /** Estado de carregamento do formulário */
  if (isLoadingOrg) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Organization Settings
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo: Nome da organização */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Acme Corp"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the display name of your organization across the platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informações complementares (somente leitura) */}
            {org && (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="text-sm font-medium text-slate-700">
                  Organization Details
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-slate-500">Plan: </span>
                    <span className="font-medium capitalize text-slate-900">
                      {org.plan}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Created: </span>
                    <span className="font-medium text-slate-900">
                      {new Date(org.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de submit com loading state */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateOrg.isPending || !form.formState.isDirty}
              >
                {updateOrg.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

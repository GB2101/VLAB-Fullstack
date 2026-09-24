import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/solicitacoes_/_pages/registrar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/solicitacoes/registrar"!</div>
}

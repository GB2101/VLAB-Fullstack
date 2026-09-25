<?php

namespace App\Http\Services;

use App\Enums\Priority;
use App\Enums\Status;
use App\Http\Requests\StoreSolicitationRequest;
use App\Models\Solicitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class SolicitationService
{
    public function create(StoreSolicitationRequest $request): Solicitation
    {
        $status = Status::Received;
        $priority = $request->input('prioridade');
        $category = $request->input('categoria');
        $protocol = self::generateProtocol($category);

        $solicitation = Solicitation::create([
            'protocolo' => $protocol,
            'nome_solicitante' => $request->input('nome_solicitante'),
            'descricao' => $request->input('descricao'),
            'status' => $status,
            'categoria' => $category,
            'prioridade' => $priority,
            'justificativa_prioridade' => $request->input('justificativa_prioridade'),
        ]);

        return $solicitation;
    }

    public function statusTransition(Solicitation $solicitation, Status $target)
    {
        $status = $solicitation->status;

        if (! $status->validTransition($target)) {
            throw new InvalidArgumentException("A transição do Status {$status->value} para {$target->value} não é permitida.");
        }

        $solicitation->update([
            'status' => $target,
        ]);
    }

    public function summary(): array
    {
        $summary = Solicitation::query()
            ->select('status', 'prioridade', DB::raw('count(*) as total'))
            ->groupBy('status', 'prioridade')
            ->get();

        $countBy = fn (string $key) => $summary
            ->groupBy(fn ($item) => $item->{$key}->value)
            ->map(fn ($group) => $group->sum('total'));

        $statusCounts = $countBy('status');
        $priorityCounts = $countBy('prioridade');

        $status = collect(Status::cases())
            ->mapWithKeys(fn (Status $case) => [$case->value => $statusCounts->get($case->value, 0)]);

        $priority = collect(Priority::cases())
            ->mapWithKeys(fn (Priority $case) => [$case->value => $priorityCounts->get($case->value, 0)]);

        return [
            'total' => (int) $summary->sum('total'),
            'status' => $status,
            'prioridade' => $priority,
        ];
    }

    public static function generateProtocol(string $category): string
    {
        do {
            $initials = strtoupper(substr($category, 0, 3));
            $protocol = $initials.'-'.date('ymd-').strtoupper(Str::random(6));
        } while (Solicitation::where('protocolo', $protocol)->exists());

        return $protocol;
    }
}

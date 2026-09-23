<?php

namespace App\Http\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

use App\Models\Solicitation;
use App\Enums\Category;
use App\Enums\Priority;
use App\Enums\Status;
use App\Http\Requests\StoreSolicitationRequest;
use InvalidArgumentException;

class SolicitationService
{
    public function create(StoreSolicitationRequest $request): Solicitation {
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

    public function statusTransition(Solicitation $solicitation, Status $target) {
        $status = $solicitation->status;

        if (!$status->validTransition($target)) {
            throw new InvalidArgumentException("A transição do Status {$status->value} para {$target->value} não é permitida.");
        }

        $solicitation->update([
            'status' => $target,
        ]);
    }

    public function summary() {
        $collect = fn ($collection) => $collection->reduce(fn ($carry, $item) => $carry + $item->total);

        $summary = Solicitation::query()
            ->select('status', 'prioridade', DB::raw('count(*) as total'))
            ->groupBy('status', 'prioridade')
            ->get();

        $status = $summary
            ->groupBy(fn ($item) => $item->status->value)
            ->map($collect);

        $priority = $summary
            ->groupBy(fn ($item) => $item->prioridade->value)
            ->map($collect);

        return [
            'status' => $status,
            'prioridade' => $priority,
        ];
    }


    public static function generateProtocol(string $category): string {
        do {
            $initials = strtoupper(substr($category, 0, 3));
            $protocol = $initials . '-' . date('ymd-') . strtoupper(Str::random(6));
        } while (Solicitation::where('protocolo', $protocol)->exists());

        return $protocol;
    }
}

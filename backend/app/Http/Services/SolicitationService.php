<?php

namespace App\Http\Services;

use Illuminate\Support\Str;

use App\Models\Solicitation;
use App\Enums\Category;
use App\Enums\Priority;
use App\Enums\Status;
use App\Http\Requests\StoreSolicitationRequest;

class SolicitationService
{
    public static function create(StoreSolicitationRequest $request): Solicitation {
        $status = Status::Received;
        $priority = $request->input('prioridade', Priority::Low);
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

    public static function generateProtocol(string $category): string {
        do {
            $initials = strtoupper(substr($category, 0, 3));
            $protocol = $initials . '-' . date('Ymd-') . strtoupper(Str::random(8));
        } while (Solicitation::where('protocolo', $protocol)->exists());

        return $protocol;
    }
}

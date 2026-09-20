<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

use App\Enums\Category;
use App\Enums\Priority;
use App\Enums\Status;

class Solicitation extends Model
{
    /** @use HasFactory<\Database\Factories\SolicitationFactory> */
    use HasFactory;

    protected $fillable = [
        'protocolo',
        'nome_solicitante',
        'descricao',
        'categoria',
        'status',
        'prioridade',
        'justificativa_prioridade',
    ];

    protected $attributes = [
        'status' => Status::Received,
    ];

    protected function casts(): array {
        return [
            'categoria' => Category::class,
            'prioridade' => Priority::class,
            'status' => Status::class,
        ];
    }
}

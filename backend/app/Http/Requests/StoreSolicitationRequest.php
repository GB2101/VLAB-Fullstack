<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Enums\Category;
use App\Enums\Priority;

class StoreSolicitationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome_solicitante' => ['required', 'string', 'max:255'],
            'descricao' => ['required', 'string'],
            'categoria' => ['required', Rule::enum(Category::class)],
            'prioridade' => ['sometimes', Rule::enum(Priority::class)],
            'justificativa_prioridade' => ['nullable', 'string', 'required_if:prioridade,' . Priority::Urgent->value],
        ];
    }
}

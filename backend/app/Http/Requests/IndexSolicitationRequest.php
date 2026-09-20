<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Enums\Category;
use App\Enums\Priority;
use App\Enums\Status;

class IndexSolicitationRequest extends FormRequest
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
            'page' => ['sometimes', 'integer', 'min:1'],
            'pageSize' => ['sometimes', 'integer', 'min:1'],

            'categoria' => ['sometimes', 'array'],
            'categoria.*' => [Rule::enum(Category::class)],

            'prioridade' => ['sometimes', 'array'],
            'prioridade.*' => [Rule::enum(Priority::class)],

            'status' => ['sometimes', 'array'],
            'status.*' => [Rule::enum(Status::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'categoria' => is_string($this->categoria)
                ? explode(',', $this->categoria)
                : ($this->filled('categoria') ? $this->categoria : []),
            'prioridade' => is_string($this->prioridade)
                ? explode(',', $this->prioridade)
                : ($this->filled('prioridade') ? $this->prioridade : []),
            'status' => is_string($this->status)
                ? explode(',', $this->status)
                : ($this->filled('status') ? $this->status : []),
        ]);
    }

    protected function passedValidation(): void
    {
        $this->merge([
            'categoria' => array_map(fn ($value) => Category::from($value), $this->categoria ?? []),
            'prioridade' => array_map(fn ($value) => Priority::from($value), $this->prioridade ?? []),
            'status' => array_map(fn ($value) => Status::from($value), $this->status ?? []),
        ]);
    }
}

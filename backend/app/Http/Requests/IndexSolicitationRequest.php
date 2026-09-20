<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

use App\Enums\Category;
use App\Enums\Priority;
use App\Enums\Status;
use Override;

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
            'categoria' => ['sometimes', 'array', Rule::in(Category::cases())],
            'prioridade' => ['sometimes', 'array', Rule::in(Priority::cases())],
            'status' => ['sometimes', 'array', Rule::in(Status::cases())],
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'categoria' => $this->categoria ? explode(',', $this->categoria ?? '') : [],
            'prioridade' => $this->prioridade ? explode(',', $this->prioridade ?? '') : [],
            'status' => $this->status ? explode(',', $this->status ?? '') : [],
        ]);
    }
}

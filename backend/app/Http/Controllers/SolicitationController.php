<?php

namespace App\Http\Controllers;

use App\Enums\Status;
use App\Http\Requests\IndexSolicitationRequest;
use App\Http\Requests\PatchSolicitationRequest;
use App\Http\Requests\StoreSolicitationRequest;
use App\Http\Resources\SolicitationCollection;
use App\Http\Resources\SolicitationResource;
use App\Http\Services\SolicitationService;
use App\Models\Solicitation;
use Exception;

class SolicitationController extends Controller
{
    public function __construct(
        public readonly SolicitationService $solicitationService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(IndexSolicitationRequest $request)
    {
        $pageSize = $request->input('pageSize', 15);
        $category = $request->input('categoria', []);
        $priority = $request->input('prioridade', []);
        $status = $request->input('status', []);

        $query = Solicitation::query()
            ->when($category, fn ($query) => $query->whereIn('categoria', $category))
            ->when($priority, fn ($query) => $query->whereIn('prioridade', $priority))
            ->when($status, fn ($query) => $query->whereIn('status', $status));

        $results = $query->paginate($pageSize);

        return new SolicitationCollection($results->appends($request->query()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSolicitationRequest $request)
    {
        $solicitation = $this->solicitationService->create($request);

        return (new SolicitationResource($solicitation))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Solicitation $solicitation)
    {
        return new SolicitationResource($solicitation);
    }

    public function summary(): array
    {
        return $this->solicitationService->summary();
    }

    public function transition(PatchSolicitationRequest $request, Solicitation $solicitation)
    {
        try {

            $status = Status::from($request->input('status'));
            $this->solicitationService->statusTransition($solicitation, $status);

            return response()->json(status: 204);
        } catch (Exception $e) {
            return response()->json(
                status: 400,
                data: [
                    'message' => $e->getMessage(),
                ]
            );
        }
    }
}

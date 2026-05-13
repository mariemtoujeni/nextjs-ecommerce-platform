import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAllEventsUseCase } from "@repo/core/usecases";
import { setup, teardown } from "./_Setup";

describe('listAllEvents', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('should return all Events', async () => {
        const events = await listAllEventsUseCase();
        expect(events.count).toBe(2);
        expect(events.items).toHaveLength(2);
    })
})
describe("Payoff javascript library", function() {
    var payoff;

    it("exists.", function() {
        expect(Payoff).not.toBe(jasmine.any(Function));
    });

    payoff = new Payoff({
        rate: 0.04,
        duration: 360,
        amount: 300000,
        startMonth: 1,
        startYear: 2018
    });

    it("returns a payoff instance.", function() {
        expect(payoff).toEqual(jasmine.any(Object));
    });

    it("generates an amortization table.", function() {
        expect(payoff.table).toEqual(jasmine.any(Array));
    });
});
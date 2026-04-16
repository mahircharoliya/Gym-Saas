/**
 * Replace {{first_name}}, {{last_name}}, {{date}} tokens in waiver body.
 */
export function renderWaiver(
    body: string,
    vars: { firstName: string; lastName: string; date?: string }
): string {
    const date = vars.date ?? new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });
    return body
        .replace(/\{\{first_name\}\}/gi, vars.firstName)
        .replace(/\{\{last_name\}\}/gi, vars.lastName)
        .replace(/\{\{date\}\}/gi, date);
}

export const EMAIL_ERROR_MESSAGES: Record<string, string> = {
    notString: 'Email must be text',
    missingAtSymbol: 'Email must contain an @ symbol',
    invalidLocalPart: 'Invalid characters before the @ symbol',
    missingTld: 'Email must include a domain like .com or .dk',
    invalidDomain: 'Invalid domain name',
    invalidTld: 'Top-level domain must be at least two letters',
};

const LOCAL_PART_REGEX = /^[A-Za-z0-9._%+-]+$/;
const DOMAIN_REGEX = /^[A-Za-z0-9.-]+$/;
const TLD_REGEX = /^[A-Za-z]{2,}$/;

export function validateEmail(value: string): string | true {
    if (!value) return true;

    const errors: string[] = [];

    if (typeof value !== 'string') {
        return EMAIL_ERROR_MESSAGES['notString'];
    }

    const parts = value.split('@');

    if (parts.length !== 2) {
        errors.push(EMAIL_ERROR_MESSAGES['missingAtSymbol']);
    }

    const localPart = parts[0] ?? '';
    const domainPart = parts[1] ?? '';

    if (localPart && !LOCAL_PART_REGEX.test(localPart)) {
        errors.push(EMAIL_ERROR_MESSAGES['invalidLocalPart']);
    }

    const domainSections = domainPart.split('.');

    if (domainSections.length < 2) {
        errors.push(EMAIL_ERROR_MESSAGES['missingTld']);
    }

    const tld = domainSections.at(-1) ?? '';
    const domainName = domainSections.slice(0, -1).join('.');

    if (domainName && !DOMAIN_REGEX.test(domainName)) {
        errors.push(EMAIL_ERROR_MESSAGES['invalidDomain']);
    }

    if (tld && !TLD_REGEX.test(tld)) {
        errors.push(EMAIL_ERROR_MESSAGES['invalidTld']);
    }

    return errors.length ? errors[0] : true;
}

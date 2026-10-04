// FAQ single source of truth. Rendered visibly (<details>) AND injected into
// FAQPage JSON-LD verbatim — the two can never drift. Answers: 40–80 words,
// direct-answer-first. Long-tail keywords woven naturally (see seo/home-keyword-plan.md).
export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: 'What is an IPTV free trial and how does it work?',
    a: 'An IPTV free trial is a short evaluation period — typically 24 to 72 hours — where you test the full service before paying. You sign up, receive login details or an M3U link, load it in any compatible M3U playlist player, and explore live channels, sports categories and video on demand. If the quality and selection suit you, convert the trial into a paid IPTV subscription.',
  },
  {
    q: 'How do I buy an IPTV subscription?',
    a: 'To buy an IPTV subscription, message us through the contact page with your device type and how many screens you need. We create your login, send the setup details and M3U link by email, and the trial converts to a monthly or longer plan only when you confirm. Nothing is ever charged before you approve it yourself.',
  },
  {
    q: 'What do IPTV subscription plans include?',
    a: 'A standard IPTV subscription service bundle includes a broad lineup of live channels across sports, movies, news, kids and international categories, plus video-on-demand libraries and an electronic program guide. Premium tiers add 4K streams, multi-device connections and catch-up TV. Every Public IPTV plan starts with a free trial so you verify the lineup before committing.',
  },
  {
    q: 'How long should I test a service before subscribing?',
    a: 'Test for at least one full evening of peak viewing plus one live sports event — that is when buffering and overload show up. A 72 hour IPTV free trial window is ideal because it covers both weekday and weekend peaks. Check channel zapping speed, 4K stability on your fastest screen, EPG accuracy and how quickly support answers one real question.',
  },
  {
    q: 'Monthly or lifetime IPTV subscription — which is better?',
    a: 'For most viewers, a monthly or 12 month IPTV subscription is the safer choice: lower upfront cost, freedom to cancel, and leverage if quality drops. Lifetime offers look cheap per month but lock you to one provider for years with no refund path. Start monthly, and only extend to a longer IPTV subscription once three months of stable evenings prove the service.',
  },
  {
    q: 'Can I really watch in 4K? What internet speed do I need?',
    a: 'Yes — premium 4K streams need about 25 Mbps of stable bandwidth per screen, 10 Mbps for HD. Use wired Ethernet or 5 GHz Wi-Fi, close background downloads, and pick the 4K feed only on screens that support it; the best 4K IPTV subscription still stutters on a congested 2.4 GHz network. If a channel buffers, drop one quality step before blaming the provider.',
  },
  {
    q: 'Which devices and M3U playlist players are supported?',
    a: 'Any device that runs a compatible M3U playlist player works: smart TVs, streaming sticks, Android and iOS phones and tablets, computers and web browsers. Most users load the provided M3U link or Xtream-style login into popular player apps — including Smarters-style and similar generic IPTV players — then sign in on up to the number of screens your plan allows.',
  },
  {
    q: 'Is IPTV legal?',
    a: 'IPTV technology itself is fully legal — it is simply television delivered over internet protocol, used by major telecom operators worldwide. What matters is licensing: a legitimate IPTV provider holds distribution rights for its content in your country. Before subscribing to any provider, confirm it publishes company details, clear terms and a refund policy, and check your local regulations.',
  },
  {
    q: 'What can I watch — is it good for sports fans?',
    a: 'Lineups are organized into categories: live sports, movies, series, news, kids, documentaries and international channels, plus on-demand libraries. It is widely considered among the best IPTV for sports viewing because dedicated sports categories gather multiple events in one guide with EPG reminders. We describe categories generically and never resell access to unlicensed broadcasts.',
  },
  {
    q: 'What if a stream buffers or my login stops working?',
    a: 'First restart the app, switch to a lower-quality feed and test another channel to isolate the issue. Still stuck? Re-log with fresh credentials and check your provider status page. Every subscription includes human support — contact us with your device model, app name and the exact failing channel, and we diagnose instead of guessing. Refund terms apply if faults persist.',
  },
];
